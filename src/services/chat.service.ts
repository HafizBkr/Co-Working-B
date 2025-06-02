import mongoose from "mongoose";
import Chat from "../models/Chat";
import Message from "../models/Message";
import { realtimeService } from "../server";

export const ChatService = {
  /**
   * Create a new chat in a workspace
   */
  createChat: async (
    workspaceId: string,
    creatorId: string,
    participants: string[],
    name?: string,
    isDirectMessage = false,
  ) => {
    const chat = await Chat.create({
      workspace: workspaceId,
      participants,
      name,
      isDirectMessage,
      createdBy: creatorId,
    });

    // Notify participants about the new chat
    participants.forEach((userId) => {
      realtimeService.sendToUser(userId, "new-chat", {
        chatId: chat._id,
        workspaceId,
        participants,
        name,
        isDirectMessage,
      });
    });

    return chat;
  },

  /**
   * Get all chats for a user in a workspace
   */
  getUserChats: async (workspaceId: string, userId: string) => {
    return Chat.find({
      workspace: workspaceId,
      participants: userId,
    }).populate("participants", "name email profilePicture username");
  },

  /**
   * Get a single chat by ID
   */
  getChatById: async (chatId: string) => {
    return Chat.findById(chatId).populate(
      "participants",
      "name email profilePicture username",
    );
  },

  /**
   * Add a user to a chat
   */
  addUserToChat: async (chatId: string, userId: string) => {
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { $addToSet: { participants: userId } },
      { new: true },
    ).populate("participants", "name email profilePicture username");

    if (chat) {
      // Notify chat participants about the new member
      realtimeService.broadcastToChat(chatId, "user-added", {
        chatId,
        userId,
      });
    }

    return chat;
  },

  /**
   * Send a message to a chat
   */
  sendMessage: async (
    chatId: string,
    senderId: string,
    content: string,
    attachments?: string[],
  ) => {
    // Create and save the message
    const message = await Message.create({
      chat: chatId,
      sender: senderId,
      content,
      attachments: attachments || [],
      readBy: [senderId],
    });

    // Get the populated message
    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "name email profilePicture username",
    );

    // Notify chat participants about the new message
    realtimeService.broadcastToChat(chatId, "new-message", populatedMessage);

    return populatedMessage;
  },

  /**
   * Get or create a direct message chat between two users in a workspace
   */
  getOrCreateDirectMessage: async (
    workspaceId: string,
    userId1: string,
    userId2: string,
  ) => {
    let chat = await Chat.findOne({
      workspace: workspaceId,
      isDirectMessage: true,
      participants: { $all: [userId1, userId2], $size: 2 },
    });

    if (!chat) {
      chat = await Chat.create({
        workspace: workspaceId,
        participants: [userId1, userId2],
        isDirectMessage: true,
        createdBy: userId1,
      });
    }

    return chat;
  },

  getChatMessages: async (chatId: string) => {
    return await Message.find({ chat: chatId })
      .populate("sender", "username email name profilePicture")
      .sort({ createdAt: 1 });
  },

  /**
   * Mark messages as read by user
   */
  markMessagesAsRead: async (chatId: string, userId: string) => {
    const result = await Message.updateMany(
      { chat: chatId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } },
    );

    if (result.modifiedCount > 0) {
      // Notify chat participants that messages were read
      realtimeService.broadcastToChat(chatId, "messages-read", {
        chatId,
        userId,
      });
    }

    return result.modifiedCount;
  },
};

export default ChatService;
