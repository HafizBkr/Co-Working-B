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
      const userId = req.user?.userId;

      const messages = await ChatService.getChatMessages(chatId);

      // Auto-marquer comme lu quand on récupère les messages
      if (userId) {
        await ChatService.markMessagesAsRead(chatId, userId);
      }

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

  static async markMessagesAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: "User ID is required",
        });
        return;
      }

      const modifiedCount = await ChatService.markMessagesAsRead(
        chatId,
        userId,
      );

      res.status(200).json({
        success: true,
        message: `${modifiedCount} messages marked as read`,
        data: { modifiedCount },
      });
    } catch (error: any) {
      console.error("Mark messages as read error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to mark messages as read",
      });
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

  // ===== MESSAGE CRUD OPERATIONS =====

  static async getMessageById(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User ID is required",
        });
        return;
      }

      const message = await ChatService.getMessageById(messageId, userId);

      res.status(200).json({
        success: true,
        data: message,
      });
    } catch (error: any) {
      console.error("Get message error:", error);
      if (error.message === "Message not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else if (error.message === "You don't have access to this message") {
        res.status(403).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to get message",
        });
      }
    }
  }

  static async updateMessage(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      const { content } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User ID is required",
        });
        return;
      }

      if (!content || content.trim() === "") {
        res.status(400).json({
          success: false,
          message: "Message content is required",
        });
        return;
      }

      const updatedMessage = await ChatService.updateMessage(
        messageId,
        userId,
        content.trim(),
      );

      res.status(200).json({
        success: true,
        message: "Message updated successfully",
        data: updatedMessage,
      });
    } catch (error: any) {
      console.error("Update message error:", error);
      if (error.message === "Message not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else if (error.message === "You can only edit your own messages") {
        res.status(403).json({
          success: false,
          message: error.message,
        });
      } else if (error.message.includes("too old")) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to update message",
        });
      }
    }
  }

  static async deleteMessage(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      const { soft = false } = req.query; // soft delete par query param
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User ID is required",
        });
        return;
      }

      let result;
      if (soft === "true") {
        result = await ChatService.softDeleteMessage(messageId, userId);
      } else {
        result = await ChatService.deleteMessage(messageId, userId);
      }

      res.status(200).json({
        success: true,
        message:
          soft === "true"
            ? "Message soft deleted successfully"
            : "Message deleted successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Delete message error:", error);
      if (error.message === "Message not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else if (error.message === "You can only delete your own messages") {
        res.status(403).json({
          success: false,
          message: error.message,
        });
      } else if (error.message.includes("too old")) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to delete message",
        });
      }
    }
  }
}
