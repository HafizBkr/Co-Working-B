import express from "express";
import type { RequestHandler } from "express";
import { authenticateJWT } from "../middleware/auth.middleware";
import { hasWorkspaceAccess } from "../middleware/workspace.middleware";
import { ChatController } from "../controllers/chat.controller";
import { hasMessageAccess } from "../middleware/message.middleware";

const router = express.Router();

const hasChatAccess: RequestHandler = (req, res, next) => {
  next();
};

const createChatHandler: RequestHandler = async (req, res) => {
  await ChatController.createChat(req, res);
};

const getUserChatsHandler: RequestHandler = async (req, res) => {
  await ChatController.getUserChats(req, res);
};

const getChatByIdHandler: RequestHandler = async (req, res) => {
  await ChatController.getChatById(req, res);
};

const sendMessageHandler: RequestHandler = async (req, res) => {
  await ChatController.sendMessage(req, res);
};

const getMessageHandler: RequestHandler = async (req, res) => {
  await ChatController.getChatMessages(req, res);
};

const markChatAsReadHandler: RequestHandler = async (req, res) => {
  await ChatController.markMessagesAsRead(req, res);
};

const getOrCreateDirectMessageHandler: RequestHandler = async (req, res) => {
  await ChatController.getOrCreateDirectMessage(req, res);
};

// Message CRUD handlers
const getMessageByIdHandler: RequestHandler = async (req, res) => {
  await ChatController.getMessageById(req, res);
};

const updateMessageHandler: RequestHandler = async (req, res) => {
  await ChatController.updateMessage(req, res);
};

const deleteMessageHandler: RequestHandler = async (req, res) => {
  await ChatController.deleteMessage(req, res);
};

// ===== CHAT ROUTES =====

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

router.post("/dm", authenticateJWT, getOrCreateDirectMessageHandler);

router.get(
  "/:chatId/messages",
  authenticateJWT,
  hasChatAccess,
  getMessageHandler,
);

// ===== MESSAGE CRUD ROUTES =====

router.get(
  "/messages/:messageId",
  authenticateJWT,
  hasMessageAccess,
  getMessageByIdHandler,
);

router.put(
  "/messages/:messageId",
  authenticateJWT,
  hasMessageAccess,
  updateMessageHandler,
);

router.delete(
  "/messages/:messageId",
  authenticateJWT,
  hasMessageAccess,
  deleteMessageHandler,
);

export default router;
