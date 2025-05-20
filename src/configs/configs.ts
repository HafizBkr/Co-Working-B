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

export const config = {
  port: parseInt(process.env.PORT as string, 10),
  mongoUri: process.env.MONGO_URI as string,
  emailUser: process.env.EMAIL_USER as string,
};
