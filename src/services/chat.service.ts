import mongoose from 'mongoose';
import Chat from '../models/Chat';
import Message from '../models/Message';
import { realtimeService } from '../server';

export const ChatService = {
  /**
   * Create a new chat in a workspace
   */
  createChat: async (workspaceId: string, creatorId: string, participants: string[], name?: string, isDirectMessage = false) => {
    const chat = await Chat.create({
      workspace: workspaceId,
      participants,
      name,
      isDirectMessage,
      createdBy: creatorId
    });

    // Notify participants about the new chat
    participants.forEach(userId => {
      realtimeService.sendToUser(userId, 'new-chat', {
        chatId: chat._id,
        workspaceId,
        participants,
        name,
        isDirectMessage
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
      participants: userId
    }).populate('participants', 'name email profilePicture');
  },

  /**
   * Get a single chat by ID
   */
  getChatById: async (chatId: string) => {
    return Chat.findById(chatId).populate('participants', 'name email profilePicture');
  },

  /**
   * Add a user to a chat
   */
  addUserToChat: async (chatId: string, userId: string) => {
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { $addToSet: { participants: userId } },
      { new: true }
    ).populate('participants', 'name email profilePicture');

    if (chat) {
      // Notify chat participants about the new member
      realtimeService.broadcastToChat(chatId, 'user-added', {
        chatId,
        userId
      });
    }

    return chat;
  },

  /**
   * Send a message to a chat
   */
  sendMessage: async (chatId: string, senderId: string, content: string, attachments?: string[]) => {
    // Create and save the message
    const message = await Message.create({
      chat: chatId,
      sender: senderId,
      content,
      attachments: attachments || [],
      readBy: [senderId]
    });

    // Get the populated message
    const populatedMessage = await Message.findById(message._id).populate('sender', 'name email profilePicture');

    // Notify chat participants about the new message
    realtimeService.broadcastToChat(chatId, 'new-message', populatedMessage);

    return populatedMessage;
  },

  /**
   * Mark messages as read by user
   */
  markMessagesAsRead: async (chatId: string, userId: string) => {
    const result = await Message.updateMany(
      { chat: chatId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    if (result.modifiedCount > 0) {
      // Notify chat participants that messages were read
      realtimeService.broadcastToChat(chatId, 'messages-read', {
        chatId,
        userId
      });
    }

    return result.modifiedCount;
  }
};

export default ChatService;
