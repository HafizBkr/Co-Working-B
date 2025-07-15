import express from "express";
import type { RequestHandler } from "express";
import { authenticateJWT } from "../middleware/auth.middleware";
import { hasWorkspaceAccess } from "../middleware/workspace.middleware";
import { ChatMembersController } from "../controllers/chat-members.controller";

const router = express.Router();

const getWorkspaceChatMembersHandler: RequestHandler = async (req, res) => {
  await ChatMembersController.getWorkspaceChatMembers(req, res);
};

const getUserChatStatsHandler: RequestHandler = async (req, res) => {
  await ChatMembersController.getUserChatStats(req, res);
};

// Routes pour les membres de chat
router.get(
  "/workspace/:workspaceId/members",
  authenticateJWT,
  hasWorkspaceAccess,
  getWorkspaceChatMembersHandler
);

router.get(
  "/workspace/:workspaceId/stats",
  authenticateJWT,
  hasWorkspaceAccess,
  getUserChatStatsHandler
);

export default router;
