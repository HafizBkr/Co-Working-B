import { Request, Response } from "express";
import ChatService from "../services/chat.service";

export class ChatController {
  static async createChat(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId, participants, name, isDirectMessage } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: "User ID is required",
        });
        return;
      }

      const chat = await ChatService.createChat(
        workspaceId,
        userId,
        participants,
        name,
        isDirectMessage,
      );

      res.status(201).json({
        success: true,
        data: chat,
      });
    } catch (error: any) {
      console.error("Create chat error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to create chat",
      });
    }
  }

  static async getUserChats(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: "User ID is required",
        });
        return;
      }

      const chats = await ChatService.getUserChats(workspaceId, userId);

      res.status(200).json({
        success: true,
        data: chats,
      });
    } catch (error: any) {
      console.error("Get user chats error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get chats",
      });
    }
  }

  static async getChatById(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;

      const chat = await ChatService.getChatById(chatId);

      if (!chat) {
        res.status(404).json({
          success: false,
          message: "Chat not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: chat,
      });
    } catch (error: any) {
      console.error("Get chat error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get chat",
      });
    }
  }

  static async getChatMessages(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const messages = await ChatService.getChatMessages(chatId);
      res.status(200).json({ success: true, data: messages });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getOrCreateDirectMessage(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { workspaceId, userId } = req.body;
      const currentUserId = req.user?.userId;
      if (!currentUserId || !userId || !workspaceId) {
        res.status(400).json({
          success: false,
          message: "workspaceId and userId are required",
        });
        return;
      }
      const chat = await ChatService.getOrCreateDirectMessage(
        workspaceId,
        currentUserId,
        userId,
      );
      res.status(200).json({ success: true, data: chat });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const { content, attachments } = req.body;
      const senderId = req.user?.userId;

      if (!senderId) {
        res.status(400).json({
          success: false,
          message: "Sender ID is required",
        });
        return;
      }

      const message = await ChatService.sendMessage(
        chatId,
        senderId,
        content,
        attachments,
      );

      res.status(201).json({
        success: true,
        data: message,
      });
    } catch (error: any) {
      console.error("Send message error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to send message",
      });
    }
  }
}
