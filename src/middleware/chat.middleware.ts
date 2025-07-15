import { Request, Response, NextFunction, RequestHandler } from "express";
import Chat from "../models/Chat";
import mongoose from "mongoose";
import { WorkspaceMemberService } from "../services/workspace-member.service";

export const hasChatAccess: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const chatId = req.params.chatId;
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      res.status(400).json({ message: "Invalid chat ID" });
      return;
    }

    // Typage explicite du chat
    const chat = await Chat.findById(chatId)
      .select("participants workspace")
      .lean<{
        participants: mongoose.Types.ObjectId[];
        workspace: mongoose.Types.ObjectId;
      }>();
    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    // Vérifier si l'utilisateur est participant du chat
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const isParticipant = chat.participants.some((participantId) =>
      participantId.equals(userObjectId),
    );
    if (!isParticipant) {
      res.status(403).json({ message: "You do not have access to this chat" });
      return;
    }

    // Vérifier si l'utilisateur fait partie du workspace
    const hasAccessToWorkspace =
      await WorkspaceMemberService.userHasAccessToWorkspace(
        chat.workspace.toString(),
        userId,
      );
    if (!hasAccessToWorkspace) {
      res.status(403).json({
        message: "You do not have access to this workspace chat",
      });
      return;
    }

    req.chat = chat;
    next();
  } catch (error) {
    console.error("Chat access check error:", error);
    res.status(500).json({ message: "Server error" });
    return;
  }
};
