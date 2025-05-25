import express from "express";
import { authenticateJWT } from "../middleware/auth.middleware";
import {
  hasWorkspaceAccess,
  hasAdminAccess,
} from "../middleware/workspace.middleware";
import * as workspaceController from "../controllers/workspace.controller";
import * as memberController from "../controllers/workspace-member.controller";

const router = express.Router();

router.post("/", authenticateJWT, workspaceController.createWorkspace);
router.get("/", authenticateJWT, workspaceController.getUserWorkspaces);
router.get(
  "/:workspaceId",
  authenticateJWT,
  hasWorkspaceAccess,
  workspaceController.getWorkspaceById,
);
router.put(
  "/:workspaceId",
  authenticateJWT,
  hasWorkspaceAccess,
  hasAdminAccess,
  workspaceController.updateWorkspace,
);
router.delete(
  "/:workspaceId",
  authenticateJWT,
  hasWorkspaceAccess,
  hasAdminAccess,
  workspaceController.deleteWorkspace,
);

router.get(
  "/:workspaceId/members",
  authenticateJWT,
  hasWorkspaceAccess,
  memberController.getWorkspaceMembers,
);

router.put(
  "/:workspaceId/members/:memberId",
  authenticateJWT,
  hasWorkspaceAccess,
  hasAdminAccess,
  memberController.updateMemberRole,
);
router.delete(
  "/:workspaceId/members/:memberId",
  authenticateJWT,
  hasWorkspaceAccess,
  hasAdminAccess,
  memberController.removeMember,
);

router.get(
  "/:workspaceId/active-users",
  authenticateJWT,
  hasWorkspaceAccess,
  (req, res) => {
    res.status(501).json({ message: "Not implemented yet" });
  },
);

export default router;
