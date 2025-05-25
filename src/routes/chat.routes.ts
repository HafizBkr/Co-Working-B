import express from "express";
import type { RequestHandler } from "express";
import { authenticateJWT } from "../middleware/auth.middleware";
import { hasWorkspaceAccess } from "../middleware/workspace.middleware";
import * as chatController from "../controllers/chat.controller";

const router = express.Router();

// Middleware pour vérifier l'accès au chat
const hasChatAccess: RequestHandler = (req, res, next) => {
  next();
};

// Handlers
const createChatHandler: RequestHandler = async (req, res) => {
  await chatController.createChat(req, res);
};

const getUserChatsHandler: RequestHandler = async (req, res) => {
  await chatController.getUserChats(req, res);
};

const getChatByIdHandler: RequestHandler = async (req, res) => {
  await chatController.getChatById(req, res);
};

const sendMessageHandler: RequestHandler = async (req, res) => {
  await chatController.sendMessage(req, res);
};

const markChatAsReadHandler: RequestHandler = (req, res) => {
  res.status(501).json({ message: "Not implemented yet" });
};

// Routes de chat
router.post("/", authenticateJWT, createChatHandler);

router.get(
  "/workspace/:workspaceId",
  authenticateJWT,
  hasWorkspaceAccess,
  getUserChatsHandler,
);

router.get("/:chatId", authenticateJWT, hasChatAccess, getChatByIdHandler);

router.post(
  "/:chatId/messages",
  authenticateJWT,
  hasChatAccess,
  sendMessageHandler,
);

router.put(
  "/:chatId/read",
  authenticateJWT,
  hasChatAccess,
  markChatAsReadHandler,
);

export default router;
