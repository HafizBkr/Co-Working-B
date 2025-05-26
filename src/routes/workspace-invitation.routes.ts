import express from "express";
import type { RequestHandler } from "express";
import { WorkspaceInvitationController } from "../controllers/workspace-invitation.controller";
import { authenticateJWT } from "../middleware/auth.middleware";
import {
  hasWorkspaceAccess,
  hasAdminAccess,
} from "../middleware/workspace.middleware";

const router = express.Router();

// Handlers
const inviteToWorkspaceHandler: RequestHandler = async (req, res) => {
  await WorkspaceInvitationController.inviteToWorkspace(req, res);
};

const acceptInvitationByTokenHandler: RequestHandler = async (req, res) => {
  await WorkspaceInvitationController.acceptInvitationByToken(req, res);
};

const registerAndAcceptInvitationHandler: RequestHandler = async (req, res) => {
  await WorkspaceInvitationController.registerAndAcceptInvitation(req, res);
};

// Routes
router.post(
  "/workspaces/:workspaceId/invitations",
  authenticateJWT,
  hasWorkspaceAccess,
  hasAdminAccess,
  inviteToWorkspaceHandler,
);

router.post(
  "/invitations/accept",
  authenticateJWT,
  acceptInvitationByTokenHandler,
);

router.post("/invitations/register", registerAndAcceptInvitationHandler);

export default router;
