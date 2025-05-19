import mongoose from "mongoose";
import dotenv from "dotenv";
import { config } from "./configs";

dotenv.config();

const MONGO_URI = config.mongoUri;

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connection establish sucessfully");
  } catch (error) {
    console.log(" Error connecting to MongoDB:", error);
    process.exit(1);
  }
};
