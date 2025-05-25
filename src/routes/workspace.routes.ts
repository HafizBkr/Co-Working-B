import express from "express";
import type { RequestHandler } from "express";
import { authenticateJWT } from "../middleware/auth.middleware";
import {
  hasWorkspaceAccess,
  hasAdminAccess,
} from "../middleware/workspace.middleware";
import * as workspaceController from "../controllers/workspace.controller";
import * as memberController from "../controllers/workspace-member.controller";

const router = express.Router();

// Workspace Handlers
const createWorkspaceHandler: RequestHandler = async (req, res) => {
  await workspaceController.createWorkspace(req, res);
};

const getUserWorkspacesHandler: RequestHandler = async (req, res) => {
  await workspaceController.getUserWorkspaces(req, res);
};

const getWorkspaceByIdHandler: RequestHandler = async (req, res) => {
  await workspaceController.getWorkspaceById(req, res);
};

const updateWorkspaceHandler: RequestHandler = async (req, res) => {
  await workspaceController.updateWorkspace(req, res);
};

const deleteWorkspaceHandler: RequestHandler = async (req, res) => {
  await workspaceController.deleteWorkspace(req, res);
};

// Member Handlers
const getWorkspaceMembersHandler: RequestHandler = async (req, res) => {
  await memberController.getWorkspaceMembers(req, res);
};

const updateMemberRoleHandler: RequestHandler = async (req, res) => {
  await memberController.updateMemberRole(req, res);
};

const removeMemberHandler: RequestHandler = async (req, res) => {
  await memberController.removeMember(req, res);
};

const getActiveUsersHandler: RequestHandler = (req, res) => {
  res.status(501).json({ message: "Not implemented yet" });
};

// Routes
router.post("/", authenticateJWT, createWorkspaceHandler);
router.get("/", authenticateJWT, getUserWorkspacesHandler);

router.get(
  "/:workspaceId",
  authenticateJWT,
  hasWorkspaceAccess,
  getWorkspaceByIdHandler,
);

router.put(
  "/:workspaceId",
  authenticateJWT,
  hasWorkspaceAccess,
  hasAdminAccess,
  updateWorkspaceHandler,
);

router.delete(
  "/:workspaceId",
  authenticateJWT,
  hasWorkspaceAccess,
  hasAdminAccess,
  deleteWorkspaceHandler,
);

router.get(
  "/:workspaceId/members",
  authenticateJWT,
  hasWorkspaceAccess,
  getWorkspaceMembersHandler,
);

router.put(
  "/:workspaceId/members/:memberId",
  authenticateJWT,
  hasWorkspaceAccess,
  hasAdminAccess,
  updateMemberRoleHandler,
);

router.delete(
  "/:workspaceId/members/:memberId",
  authenticateJWT,
  hasWorkspaceAccess,
  hasAdminAccess,
  removeMemberHandler,
);

router.get(
  "/:workspaceId/active-users",
  authenticateJWT,
  hasWorkspaceAccess,
  getActiveUsersHandler,
);

export default router;
