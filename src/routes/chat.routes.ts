import express from "express";
import { authenticateJWT } from "../middleware/auth.middleware";
import { hasWorkspaceAccess } from "../middleware/workspace.middleware";
import * as chatController from "../controllers/chat.controller";

const router = express.Router();

// Middleware pour vérifier l'accès au chat
const hasChatAccess = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  next();
};

// Routes de chat
router.post("/", authenticateJWT, chatController.createChat);
router.get("/workspace/:workspaceId", authenticateJWT, hasWorkspaceAccess, chatController.getUserChats);
router.get("/:chatId", authenticateJWT, hasChatAccess, chatController.getChatById);
router.post("/:chatId/messages", authenticateJWT, hasChatAccess, chatController.sendMessage);
router.put("/:chatId/read", authenticateJWT, hasChatAccess, (req, res) => {
  res.status(501).json({ message: "Not implemented yet" });
});

export default router;
