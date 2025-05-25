import express from "express";
import {
  inviteToWorkspace,
  acceptInvitationByToken,
  registerAndAcceptInvitation,
} from "../controllers/workspace-invitation.controller";
import { authenticateJWT } from "../middleware/auth.middleware";
import {
  hasWorkspaceAccess,
  hasAdminAccess,
} from "../middleware/workspace.middleware";

const router = express.Router();

router.post(
  "/workspaces/:workspaceId/invitations",
  authenticateJWT,
  hasWorkspaceAccess,
  hasAdminAccess,
  inviteToWorkspace,
);
router.post("/invitations/accept", authenticateJWT, acceptInvitationByToken);
router.post("/invitations/register", registerAndAcceptInvitation);

export default router;
