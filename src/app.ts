import express from "express";
import authRoutes from "./routes/auth.routes";
import { corsMiddleware } from "./middleware/cors.middleware";
import { requestLogger } from "./middleware/logger.middleware";
import workspaceRoutes from "./routes/workspace.routes";
import workspaceInvitationRoutes from "./routes/workspace-invitation.routes";
import projectRoutes from "./routes/project.routes";
import taskRoutes from "./routes/task.routes";
import serverHealthRoutes from "./routes/serverHealth.routes";
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
app.use("/api/v1/invitations", workspaceInvitationRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/health", serverHealthRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
export default app;
