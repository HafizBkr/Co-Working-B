import { Request, Response, NextFunction, RequestHandler } from "express";
import Chat from "../models/Chat";
import mongoose from "mongoose";
import { WorkspaceMemberService } from "../services/workspace-member.service";

declare global {
  namespace Express {
    interface Request {
      chat?: any;
      user?: { userId?: string };
    }
  }
}

// Déclare la fonction comme RequestHandler explicitement
export const hasChatAccess: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const chatId = req.params.chatId;
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chat ID" });
    }

    const chat = await Chat.findById(chatId).select("participants workspace");
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Vérifier si l'utilisateur est participant du chat
    const isParticipant = chat.participants.some((participantId: any) =>
      participantId.equals(new mongoose.Types.ObjectId(userId)),
    );
    if (!isParticipant) {
      return res
        .status(403)
        .json({ message: "You do not have access to this chat" });
    }

    // Vérifier si l'utilisateur fait partie du workspace
    const hasAccessToWorkspace =
      await WorkspaceMemberService.userHasAccessToWorkspace(
        chat.workspace.toString(),
        userId,
      );
    if (!hasAccessToWorkspace) {
      return res.status(403).json({
        message: "You do not have access to this workspace chat",
      });
    }

    req.chat = chat;
    next();
  } catch (error) {
    console.error("Chat access check error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
