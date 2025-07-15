import express from "express";
import type { RequestHandler } from "express";
import { ProjectController } from "../controllers/project.controller";
import { authenticateJWT } from "../middleware/auth.middleware";
import { hasProjectAccess } from "../middleware/project.middleware";
import {
  hasWorkspaceAccess,
  hasAdminAccess,
} from "../middleware/workspace.middleware";

const router = express.Router();

// Handlers
const createProjectHandler: RequestHandler = async (req, res) => {
  await ProjectController.createProject(req, res);
};

const getProjectsByWorkspaceHandler: RequestHandler = async (req, res) => {
  await ProjectController.getProjectsByWorkspace(req, res);
};

const getProjectByIdHandler: RequestHandler = async (req, res) => {
  await ProjectController.getProjectById(req, res);
};

const updateProjectHandler: RequestHandler = async (req, res) => {
  await ProjectController.updateProject(req, res);
};

const deleteProjectHandler: RequestHandler = async (req, res) => {
  await ProjectController.deleteProject(req, res);
};

const getProjectStatsHandler: RequestHandler = async (req, res) => {
  await ProjectController.getProjectStats(req, res);
};

const getActiveProjectsHandler: RequestHandler = async (req, res) => {
  await ProjectController.getActiveProjects(req, res);
};

const getOverdueProjectsHandler: RequestHandler = async (req, res) => {
  await ProjectController.getOverdueProjects(req, res);
};

const getCompletedProjectsHandler: RequestHandler = async (req, res) => {
  await ProjectController.getCompletedProjects(req, res);
};

const duplicateProjectHandler: RequestHandler = async (req, res) => {
  await ProjectController.duplicateProject(req, res);
};

const archiveProjectHandler: RequestHandler = async (req, res) => {
  await ProjectController.archiveProject(req, res);
};

const updateProjectDatesHandler: RequestHandler = async (req, res) => {
  await ProjectController.updateProjectDates(req, res);
};

const getProjectsByPeriodHandler: RequestHandler = async (req, res) => {
  await ProjectController.getProjectsByPeriod(req, res);
};

const getProjectStatusHandler: RequestHandler = async (req, res) => {
  await ProjectController.getProjectStatus(req, res);
};

// Pirncipal Routes

router.post(
  "/workspaces/:workspaceId/projects",
  authenticateJWT,
  hasWorkspaceAccess,
  createProjectHandler,
);

router.get(
  "/workspaces/:workspaceId/projects",
  authenticateJWT,
  hasWorkspaceAccess,
  getProjectsByWorkspaceHandler,
);

router.get(
  "/workspaces/:workspaceId/projects/stats",
  authenticateJWT,
  hasWorkspaceAccess,
  getProjectStatsHandler,
);

router.get(
  "/workspaces/:workspaceId/projects/active",
  authenticateJWT,
  hasWorkspaceAccess,
  getActiveProjectsHandler,
);

router.get(
  "/workspaces/:workspaceId/projects/overdue",
  authenticateJWT,
  hasWorkspaceAccess,
  getOverdueProjectsHandler,
);

router.get(
  "/workspaces/:workspaceId/projects/completed",
  authenticateJWT,
  hasWorkspaceAccess,
  getCompletedProjectsHandler,
);

router.get(
  "/workspaces/:workspaceId/projects/period",
  authenticateJWT,
  hasWorkspaceAccess,
  getProjectsByPeriodHandler,
);

// Routes specifique a des projet

router.get(
  "/projects/:projectId",
  authenticateJWT,
  hasProjectAccess,
  getProjectByIdHandler,
);

router.put(
  "/projects/:projectId",
  authenticateJWT,
  hasProjectAccess,
  updateProjectHandler,
);

router.delete(
  "/projects/:projectId",
  authenticateJWT,
  hasProjectAccess,
  hasAdminAccess,
  deleteProjectHandler,
);

router.post(
  "/projects/:projectId/duplicate",
  authenticateJWT,
  hasProjectAccess,
  duplicateProjectHandler,
);

router.patch(
  "/projects/:projectId/archive",
  authenticateJWT,
  hasProjectAccess,
  hasAdminAccess,
  archiveProjectHandler,
);

router.patch(
  "/projects/:projectId/dates",
  authenticateJWT,
  hasProjectAccess,
  updateProjectDatesHandler,
);

router.get(
  "/projects/:projectId/status",
  authenticateJWT,
  hasProjectAccess,
  getProjectStatusHandler,
);

export default router;
