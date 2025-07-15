import jwt from "jsonwebtoken";
import { IUserDocument } from "../repository/User.repository";
import { config } from "../configs/configs";

const JWT_SECRET = config.jwtSecret;
const JWT_EXPIRES_IN = config.jwtExpiresIn;

export const generateToken = (user: IUserDocument): string => {
  const payload = {
    userId: user._id,
    email: user.email,
    username: user.username,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
