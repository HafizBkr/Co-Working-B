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
   * Send a message to a chat (le contenu sera automatiquement chiffré par le middleware)
   */
  sendMessage: async (
    chatId: string,
    senderId: string,
    content: string,
    attachments?: string[],
  ) => {
    // Create and save the message (le middleware va chiffrer automatiquement le contenu)
    const message = await Message.create({
      chat: chatId,
      sender: senderId,
      content, // Sera chiffré automatiquement par le middleware pre-save
      attachments: attachments || [],
      readBy: [senderId],
    });

    // Get the populated message
    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "name email profilePicture username",
    );

    if (!populatedMessage) {
      throw new Error("Message not found after creation");
    }

    // Créer une version déchiffrée pour l'envoi temps réel
    const messageForRealtime = {
      ...populatedMessage.toObject(),
      content: populatedMessage.getDecryptedContent(), // Déchiffrer pour l'envoi temps réel
    };

    // Notify chat participants about the new message
    realtimeService.broadcastToChat(chatId, "new-message", messageForRealtime);

    return messageForRealtime;
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

  /**
   * Get chat messages with decrypted content
   */
  getChatMessages: async (chatId: string) => {
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "username email name profilePicture")
      .sort({ createdAt: 1 });

    // Déchiffrer le contenu de tous les messages
    return messages.map((message) => ({
      ...message.toObject(),
      content: message.getDecryptedContent(),
    }));
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

  /**
   * Get a single message by ID with decrypted content
   */
  getMessageById: async (messageId: string, userId: string) => {
    const message = await Message.findById(messageId)
      .populate("sender", "username email name profilePicture")
      .populate({
        path: "chat",
        populate: {
          path: "participants",
          select: "username email name profilePicture",
        },
      });

    if (!message) {
      throw new Error("Message not found");
    }

    // Vérifier que l'utilisateur a accès au chat
    const chat = message.chat as any;
    if (!chat.participants.some((p: any) => p._id.toString() === userId)) {
      throw new Error("You don't have access to this message");
    }

    return {
      ...message.toObject(),
      content: message.getDecryptedContent(),
    };
  },

  /**
   * Update a message by ID (only sender can update)
   */
  updateMessage: async (
    messageId: string,
    userId: string,
    newContent: string,
  ) => {
    const message = await Message.findById(messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    // Vérifier que l'utilisateur est l'expéditeur
    if (message.sender.toString() !== userId) {
      throw new Error("You can only edit your own messages");
    }

    // Vérifier que le message n'est pas trop ancien (ex: 24h)
    const messageAge = Date.now() - message.createdAt.getTime();
    const maxEditTime = 24 * 60 * 60 * 1000; // 24 heures
    if (messageAge > maxEditTime) {
      throw new Error("Message is too old to be edited (24h limit)");
    }

    // Mettre à jour le contenu (sera automatiquement chiffré par le middleware)
    message.content = newContent;
    message.updatedAt = new Date();
    await message.save();

    // Récupérer le message mis à jour avec population
    const updatedMessage = await Message.findById(messageId).populate(
      "sender",
      "username email name profilePicture",
    );

    if (!updatedMessage) {
      throw new Error("Failed to retrieve updated message");
    }

    // Créer une version déchiffrée pour l'envoi temps réel
    const messageForRealtime = {
      ...updatedMessage.toObject(),
      content: updatedMessage.getDecryptedContent(),
      isEdited: true,
    };

    // Notifier les participants du chat de la modification
    realtimeService.broadcastToChat(
      message.chat.toString(),
      "message-updated",
      messageForRealtime,
    );

    return messageForRealtime;
  },

  /**
   * Delete a message by ID (only sender can delete)
   */
  deleteMessage: async (messageId: string, userId: string) => {
    const message = await Message.findById(messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    // Vérifier que l'utilisateur est l'expéditeur
    if (message.sender.toString() !== userId) {
      throw new Error("You can only delete your own messages");
    }

    // Vérifier que le message n'est pas trop ancien (ex: 24h)
    const messageAge = Date.now() - message.createdAt.getTime();
    const maxDeleteTime = 24 * 60 * 60 * 1000; // 24 heures
    if (messageAge > maxDeleteTime) {
      throw new Error("Message is too old to be deleted (24h limit)");
    }

    const chatId = message.chat.toString();

    // Supprimer le message
    await Message.findByIdAndDelete(messageId);

    // Notifier les participants du chat de la suppression
    realtimeService.broadcastToChat(chatId, "message-deleted", {
      messageId,
      chatId,
      deletedBy: userId,
    });

    return { messageId, deleted: true };
  },

  /**
   * Soft delete a message (mark as deleted instead of removing)
   */
  softDeleteMessage: async (messageId: string, userId: string) => {
    const message = await Message.findById(messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    // Vérifier que l'utilisateur est l'expéditeur
    if (message.sender.toString() !== userId) {
      throw new Error("You can only delete your own messages");
    }

    // Marquer comme supprimé en changeant le contenu
    message.content = "[Message supprimé]";
    message.updatedAt = new Date();
    await message.save();

    // Récupérer le message mis à jour
    const updatedMessage = await Message.findById(messageId).populate(
      "sender",
      "username email name profilePicture",
    );

    if (!updatedMessage) {
      throw new Error("Failed to retrieve updated message");
    }

    const messageForRealtime = {
      ...updatedMessage.toObject(),
      content: "[Message supprimé]",
      isDeleted: true,
    };

    // Notifier les participants du chat
    realtimeService.broadcastToChat(
      message.chat.toString(),
      "message-soft-deleted",
      messageForRealtime,
    );

    return messageForRealtime;
  },
};

export default ChatService;
