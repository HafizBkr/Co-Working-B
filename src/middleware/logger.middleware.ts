import { Request, Response, NextFunction } from "express";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (process.env.NODE_ENV === "production") {
    res.on("finish", () => {
      if (res.statusCode >= 500) {
        console.error(
          `[ERROR] ${req.method} ${req.originalUrl} ${res.statusCode} - ${req.ip}`,
        );
      }
    });
    return next();
  }

  const start = Date.now();

  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);

  if (
    ["POST", "PUT", "PATCH"].includes(req.method) &&
    req.body &&
    Object.keys(req.body).length > 0 &&
    !req.is("multipart/form-data") &&
    JSON.stringify(req.body).length < 1000
  ) {
    console.log("Body:", JSON.stringify(req.body, null, 2));
  }

  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode >= 400 ? "❌" : "✅";
    console.log(
      `${status} ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`,
    );
  });

  next();
};
