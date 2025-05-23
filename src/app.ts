import express from "express";
import authRoutes from "./routes/auth";
import { corsMiddleware } from "./middleware/cors.middleware";
import { requestLogger } from "./middleware/logger.middleware";
import workspaceRoutes from "./routes/workspace.routes";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middleware/error.middleware";

const app = express();

app.use(corsMiddleware);
app.use(express.json());
app.use(requestLogger);

app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/workspaces", workspaceRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
export default app;
