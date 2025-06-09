import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../configs/configs";

interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string };
    }
  }
}

const tokenCache = new Map<
  string,
  {
    userId: string;
    exp: number;
    cachedAt: number;
  }
>();

const CACHE_TTL = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 1000;
const CLEANUP_INTERVAL = 10 * 60 * 1000;

let lastCleanup = Date.now();

function cleanupCache(): void {
  const now = Date.now();

  if (
    now - lastCleanup < CLEANUP_INTERVAL &&
    tokenCache.size < MAX_CACHE_SIZE
  ) {
    return;
  }

  for (const [token, data] of tokenCache.entries()) {
    if (data.exp * 1000 <= now || now - data.cachedAt > CACHE_TTL) {
      tokenCache.delete(token);
    }
  }

  lastCleanup = now;

  if (tokenCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(tokenCache.entries());
    entries.sort((a, b) => a[1].cachedAt - b[1].cachedAt);

    const toDelete = entries.slice(0, Math.floor(MAX_CACHE_SIZE * 0.2)); // Supprimer 20%
    toDelete.forEach(([token]) => tokenCache.delete(token));
  }
}

export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    const now = Date.now();

    const cached = tokenCache.get(token);
    if (cached) {
      const isTokenValid = cached.exp * 1000 > now;
      const isCacheValid = now - cached.cachedAt < CACHE_TTL;

      if (isTokenValid && isCacheValid) {
        req.user = { userId: cached.userId };
        next();
        return;
      } else {
        tokenCache.delete(token);
      }
    }

    const decoded = jwt.verify(token, config.jwtSecret) as DecodedToken;

    if (decoded.exp * 1000 <= now) {
      res.status(401).json({
        success: false,
        message: "Token expired",
      });
      return;
    }

    tokenCache.set(token, {
      userId: decoded.userId,
      exp: decoded.exp,
      cachedAt: now,
    });

    cleanupCache();

    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      tokenCache.delete(token);
    }

    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
    return;
  }
};

export const clearAuthCache = (): void => {
  tokenCache.clear();
};

export const getAuthCacheStats = () => {
  const now = Date.now();
  let validTokens = 0;
  let expiredTokens = 0;

  for (const data of tokenCache.values()) {
    if (data.exp * 1000 > now && now - data.cachedAt < CACHE_TTL) {
      validTokens++;
    } else {
      expiredTokens++;
    }
  }

  return {
    totalCached: tokenCache.size,
    validTokens,
    expiredTokens,
    hitRateEstimate: `${validTokens}/${tokenCache.size}`,
  };
};
