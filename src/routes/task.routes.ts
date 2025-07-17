import express, { RequestHandler } from "express";
import { TaskController } from "../controllers/task.controller";
import { authenticateJWT } from "../middleware/auth.middleware";
import { hasProjectAccess } from "../middleware/project.middleware";
import {
  hasAdminAccess,
  hasWorkspaceAccess,
} from "../middleware/workspace.middleware";

const router = express.Router();

// Handlers
const createTaskHandler: RequestHandler = async (req, res) => {
  await TaskController.createTask(req, res);
};

const getTasksByProjectHandler: RequestHandler = async (req, res) => {
  await TaskController.getTasksByProject(req, res);
};

const getTasksByWorkspaceHandler: RequestHandler = async (req, res) => {
  await TaskController.getTasksByWorkspace(req, res);
};

const getTasksByAssignedToHandler: RequestHandler = async (req, res) => {
  await TaskController.getTasksByAssignedTo(req, res);
};

const getTasksByStatusHandler: RequestHandler = async (req, res) => {
  await TaskController.getTasksByStatus(req, res);
};

const getTaskByIdHandler: RequestHandler = async (req, res) => {
  await TaskController.getTaskById(req, res);
};

const updateTaskHandler: RequestHandler = async (req, res) => {
  await TaskController.updateTask(req, res);
};

const deleteTaskHandler: RequestHandler = async (req, res) => {
  await TaskController.deleteTask(req, res);
};

const assignTaskHandler: RequestHandler = async (req, res) => {
  await TaskController.assignTask(req, res);
};

const changeTaskStatusHandler: RequestHandler = async (req, res) => {
  await TaskController.changeTaskStatus(req, res);
};

// Routes

router.post(
  "/projects/:projectId/tasks",
  authenticateJWT,
  hasProjectAccess,
  createTaskHandler,
);

router.get(
  "/projects/:projectId/tasks",
  authenticateJWT,
  hasProjectAccess,
  getTasksByProjectHandler,
);

router.get(
  "/workspaces/:workspaceId/tasks",
  authenticateJWT,
  hasWorkspaceAccess,
  getTasksByWorkspaceHandler,
);

router.get(
  "/tasks/assigned/:userId",
  authenticateJWT,
  getTasksByAssignedToHandler,
);

router.get("/tasks/status/:status", authenticateJWT, getTasksByStatusHandler);

router.get("/tasks/:taskId", authenticateJWT, getTaskByIdHandler);

router.put("/tasks/:taskId", authenticateJWT, updateTaskHandler);

router.delete("/tasks/:taskId", authenticateJWT, deleteTaskHandler);

router.patch("/tasks/:taskId/assign", authenticateJWT, assignTaskHandler);

router.patch("/tasks/:taskId/status", authenticateJWT, changeTaskStatusHandler);

export default router;
