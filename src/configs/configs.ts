import dotenv from "dotenv";

dotenv.config();

if (!process.env.PORT) {
  throw new Error(" PORT is not defined in .env");
}

if (!process.env.MONGO_URI) {
  throw new Error(" MONGO_URI is not defined in .env");
}

if (!process.env.EMAIL_USER) {
  throw new Error("EMAIL_USER is not defined in .env");
}

if (!process.env.EMAIL_PASS) {
  throw new Error("EMAIL_PASS is not defined in .env");
}
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env");
}

if (!process.env.JWT_EXPIRES_IN) {
  throw new Error("JWT_EXPIRES_IN is not defined in .env");
}

export const config = {
  port: parseInt(process.env.PORT as string, 10),
  mongoUri: process.env.MONGO_URI as string,
  emailUser: process.env.EMAIL_USER as string,
  emailPass: process.env.EMAIL_PASS as string,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN as string,
};
