import { Request, Response } from "express";
import ChatService from "../services/chat.service";
import { getErrorMessage } from "../utils/error-handler";
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  RESPONSE_CODES,
} from "../utils/error_response";

export class ChatController {
  static async createChat(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId, participants, name, isDirectMessage } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(RESPONSE_CODES.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.CHAT_USER_ID_REQUIRED,
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

      res.status(RESPONSE_CODES.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.CHAT_CREATED,
        data: chat,
      });
    } catch (error: any) {
      console.error("Create chat error:", error);
      res.status(RESPONSE_CODES.SERVER_ERROR).json({
        success: false,
        message: getErrorMessage(error) || ERROR_MESSAGES.CHAT_FAILED_CREATE,
      });
    }
  }

  static async getUserChats(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(RESPONSE_CODES.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.CHAT_USER_ID_REQUIRED,
        });
        return;
      }

      const chats = await ChatService.getUserChats(workspaceId, userId);

      res.status(RESPONSE_CODES.OK).json({
        success: true,
        data: chats,
      });
    } catch (error: any) {
      console.error("Get user chats error:", error);
      res.status(RESPONSE_CODES.SERVER_ERROR).json({
        success: false,
        message: getErrorMessage(error) || ERROR_MESSAGES.CHAT_FAILED_GET_LIST,
      });
    }
  }

  static async getChatById(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;

      const chat = await ChatService.getChatById(chatId);

      if (!chat) {
        res.status(RESPONSE_CODES.NOT_FOUND).json({
          success: false,
          message: ERROR_MESSAGES.CHAT_NOT_FOUND,
        });
        return;
      }

      res.status(RESPONSE_CODES.OK).json({
        success: true,
        data: chat,
      });
    } catch (error: any) {
      console.error("Get chat error:", error);
      res.status(RESPONSE_CODES.SERVER_ERROR).json({
        success: false,
        message: getErrorMessage(error) || ERROR_MESSAGES.CHAT_FAILED_GET,
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

      res.status(RESPONSE_CODES.OK).json({ success: true, data: messages });
    } catch (error: any) {
      res.status(RESPONSE_CODES.SERVER_ERROR).json({
        success: false,
        message: getErrorMessage(error) || ERROR_MESSAGES.CHAT_FAILED_GET,
      });
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
        res.status(RESPONSE_CODES.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.CHAT_DIRECT_CREATION_PAYLOAD,
        });
        return;
      }
      const chat = await ChatService.getOrCreateDirectMessage(
        workspaceId,
        currentUserId,
        userId,
      );
      res.status(RESPONSE_CODES.OK).json({ success: true, data: chat });
    } catch (error: any) {
      res.status(RESPONSE_CODES.SERVER_ERROR).json({
        success: false,
        message: getErrorMessage(error) || ERROR_MESSAGES.CHAT_FAILED_CREATE,
      });
    }
  }

  static async markMessagesAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(RESPONSE_CODES.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.CHAT_USER_ID_REQUIRED,
        });
        return;
      }

      const modifiedCount = await ChatService.markMessagesAsRead(
        chatId,
        userId,
      );

      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.CHAT_MESSAGES_MARKED_READ,
        data: { modifiedCount },
      });
    } catch (error: any) {
      console.error("Mark messages as read error:", error);
      res.status(RESPONSE_CODES.SERVER_ERROR).json({
        success: false,
        message: getErrorMessage(error) || ERROR_MESSAGES.CHAT_FAILED_MARK_READ,
      });
    }
  }

  static async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const { content, attachments } = req.body;
      const senderId = req.user?.userId;

      if (!senderId) {
        res.status(RESPONSE_CODES.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.CHAT_USER_ID_REQUIRED,
        });
        return;
      }

      const message = await ChatService.sendMessage(
        chatId,
        senderId,
        content,
        attachments,
      );

      res.status(RESPONSE_CODES.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.CHAT_MESSAGE_SENT,
        data: message,
      });
    } catch (error: any) {
      console.error("Send message error:", error);
      res.status(RESPONSE_CODES.SERVER_ERROR).json({
        success: false,
        message:
          getErrorMessage(error) || ERROR_MESSAGES.CHAT_FAILED_SEND_MESSAGE,
      });
    }
  }

  // ===== MESSAGE CRUD OPERATIONS =====

  static async getMessageById(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(RESPONSE_CODES.UNAUTHORIZED).json({
          success: false,
          message: ERROR_MESSAGES.CHAT_USER_ID_REQUIRED,
        });
        return;
      }

      const message = await ChatService.getMessageById(messageId, userId);

      res.status(RESPONSE_CODES.OK).json({
        success: true,
        data: message,
      });
    } catch (error: any) {
      console.error("Get message error:", error);
      const errMsg = getErrorMessage(error);
      if (errMsg === "Message not found") {
        res.status(RESPONSE_CODES.NOT_FOUND).json({
          success: false,
          message: ERROR_MESSAGES.CHAT_MESSAGE_NOT_FOUND,
        });
      } else if (errMsg === "You don't have access to this message") {
        res.status(RESPONSE_CODES.FORBIDDEN).json({
          success: false,
          message: ERROR_MESSAGES.CHAT_MESSAGE_FORBIDDEN,
        });
      } else {
        res.status(RESPONSE_CODES.SERVER_ERROR).json({
          success: false,
          message: ERROR_MESSAGES.CHAT_FAILED_GET,
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
        res.status(RESPONSE_CODES.UNAUTHORIZED).json({
          success: false,
          message: ERROR_MESSAGES.CHAT_USER_ID_REQUIRED,
        });
        return;
      }

      if (!content || content.trim() === "") {
        res.status(RESPONSE_CODES.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.CHAT_MESSAGE_CONTENT_REQUIRED,
        });
        return;
      }

      const updatedMessage = await ChatService.updateMessage(
        messageId,
        userId,
        content.trim(),
      );

      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.CHAT_MESSAGE_UPDATED,
        data: updatedMessage,
      });
    } catch (error: any) {
      console.error("Update message error:", error);
      const errMsg = getErrorMessage(error);
      if (errMsg === "Message not found") {
        res.status(RESPONSE_CODES.NOT_FOUND).json({
          success: false,
          message: ERROR_MESSAGES.CHAT_MESSAGE_NOT_FOUND,
        });
      } else if (errMsg === "You can only edit your own messages") {
        res.status(RESPONSE_CODES.FORBIDDEN).json({
          success: false,
          message: ERROR_MESSAGES.CHAT_MESSAGE_EDIT_FORBIDDEN,
        });
      } else if (errMsg && errMsg.includes("too old")) {
        res.status(RESPONSE_CODES.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.CHAT_MESSAGE_TOO_OLD,
        });
      } else {
        res.status(RESPONSE_CODES.SERVER_ERROR).json({
          success: false,
          message: ERROR_MESSAGES.CHAT_FAILED_UPDATE_MESSAGE,
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
        res.status(RESPONSE_CODES.UNAUTHORIZED).json({
          success: false,
          message: ERROR_MESSAGES.CHAT_USER_ID_REQUIRED,
        });
        return;
      }

      let result;
      if (soft === "true") {
        result = await ChatService.softDeleteMessage(messageId, userId);
      } else {
        result = await ChatService.deleteMessage(messageId, userId);
      }

      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message:
          soft === "true"
            ? SUCCESS_MESSAGES.CHAT_MESSAGE_SOFT_DELETED
            : SUCCESS_MESSAGES.CHAT_MESSAGE_DELETED,
        data: result,
      });
    } catch (error: any) {
      console.error("Delete message error:", error);
      const errMsg = getErrorMessage(error);
      if (errMsg === "Message not found") {
        res.status(RESPONSE_CODES.NOT_FOUND).json({
          success: false,
          message: ERROR_MESSAGES.CHAT_MESSAGE_NOT_FOUND,
        });
      } else if (errMsg === "You can only delete your own messages") {
        res.status(RESPONSE_CODES.FORBIDDEN).json({
          success: false,
          message: ERROR_MESSAGES.CHAT_MESSAGE_DELETE_FORBIDDEN,
        });
      } else if (errMsg && errMsg.includes("too old")) {
        res.status(RESPONSE_CODES.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.CHAT_MESSAGE_TOO_OLD,
        });
      } else {
        res.status(RESPONSE_CODES.SERVER_ERROR).json({
          success: false,
          message: ERROR_MESSAGES.CHAT_FAILED_DELETE_MESSAGE,
        });
      }
    }
  }
}
