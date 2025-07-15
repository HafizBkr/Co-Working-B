import express from "express";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes";
import { corsMiddleware } from "./middleware/cors.middleware";
import { requestLogger } from "./middleware/logger.middleware";
import workspaceRoutes from "./routes/workspace.routes";
import workspaceInvitationRoutes from "./routes/workspace-invitation.routes";
import projectRoutes from "./routes/project.routes";
import taskRoutes from "./routes/task.routes";
import serverHealthRoutes from "./routes/serverHealth.routes";
import chatRoutes from "./routes/chat.routes";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middleware/error.middleware";

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(compression());

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 500 : 1000,
  message: {
    success: false,
    message: "Trop de requêtes, veuillez réessayer plus tard",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return (
      req.path === "/api/v1/health" ||
      req.path.startsWith("/api/v1/workspaces") ||
      process.env.LOAD_TEST_MODE === "true"
    );
  },
});

app.use("/api", limiter);

app.use(corsMiddleware);
app.use(
  express.json({
    limit: "10mb",
    strict: true,
  }),
);

if (process.env.NODE_ENV !== "production") {
  app.use(requestLogger);
}

app.use("/api/v1/health", serverHealthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/workspaces", workspaceRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/chats", chatRoutes);
app.use("/api/v1/invitations", workspaceInvitationRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
