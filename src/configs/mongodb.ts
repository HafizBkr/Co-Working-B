import mongoose from "mongoose";
import dotenv from "dotenv";
import { config } from "./configs";

dotenv.config();

const MONGO_URI = config.mongoUri;

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      maxPoolSize: process.env.NODE_ENV === "production" ? 50 : 20,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,

      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,

      retryWrites: true,
      writeConcern: {
        w: "majority",
        j: true,
        wtimeout: 1000,
      },
    });

    mongoose.set("strictQuery", true);

    console.log("MongoDB connecté avec optimisations de performance");

    if (process.env.NODE_ENV !== "production") {
      mongoose.connection.on("error", (err) => {
        console.error("❌ Erreur MongoDB:", err);
      });
    }
  } catch (error) {
    console.error("❌ Erreur connexion MongoDB:", error);
    process.exit(1);
  }
};

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("📦 Connexion MongoDB fermée proprement");
  process.exit(0);
});
