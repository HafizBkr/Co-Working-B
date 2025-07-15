import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { config } from "../configs/configs";
import { v4 as uuidv4 } from "uuid";

export interface InvitationTokenPayload extends JwtPayload {
  email: string;
  workspaceId: string;
  type: "workspace_invitation";
  jti: string;
}

export const generateInvitationToken = (
  email: string,
  workspaceId: string,
  expiresIn: string = "7d",
): string => {
  const payload: InvitationTokenPayload = {
    email,
    workspaceId,
    type: "workspace_invitation",
    jti: uuidv4(),
  };
  const secret: jwt.Secret = config.jwtSecret;
  if (!secret) throw new Error("JWT secret is not defined");

  return jwt.sign(payload, secret, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });
};

export const verifyInvitationToken = (
  token: string,
): InvitationTokenPayload | null => {
  try {
    return jwt.verify(token, config.jwtSecret) as InvitationTokenPayload;
  } catch {
    return null;
  }
};
