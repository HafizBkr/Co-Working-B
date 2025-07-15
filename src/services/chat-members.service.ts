import Chat from "../models/Chat";
import Message from "../models/Message";
import WorkspaceMemberRepository from "../repository/workspace-member.repository";
import mongoose from "mongoose";

/**
 * Service pour gérer les membres de chat et derniers messages
 */
export class ChatMembersService {
  /**
   * Récupère la liste des membres avec qui un utilisateur peut discuter dans un workspace,
   * incluant le chat général et les derniers messages pour chaque conversation
   *
   * @param workspaceId ID du workspace
   * @param userId ID de l'utilisateur courant
   * @returns Liste des membres avec leur statut et dernier message
   */
  static async getWorkspaceChatMembers(workspaceId: string, userId: string) {
    try {
      // 1. Récupérer tous les membres du workspace
      const members = await WorkspaceMemberRepository.getWorkspaceMembers(workspaceId);

      // 2. Exclure l'utilisateur courant de la liste des membres
      const filteredMembers = members.filter(
        member => member.user && member.user._id.toString() !== userId
      );

      // 3. Récupérer tous les chats de l'utilisateur dans ce workspace
      const userChats = await Chat.find({
        workspace: workspaceId,
        participants: userId
      }).lean();

      // 4. Récupérer le chat général (s'il existe)
      let generalChat = await Chat.findOne({
        workspace: workspaceId,
        isDirectMessage: false,
        name: "Général" // Ou un autre nom selon votre convention
      }).lean();

      // Créer le chat général s'il n'existe pas
      if (!generalChat) {
        // Créer un nouveau chat général avec tous les membres du workspace
        const allMemberIds = members.map(member =>
          member.user ? member.user._id.toString() : null
        ).filter(Boolean) as string[];

        generalChat = await Chat.create({
          workspace: workspaceId,
          name: "Général",
          isDirectMessage: false,
          participants: allMemberIds,
          createdBy: userId
        });

        generalChat = generalChat.toObject();
      }

      // 5. Récupérer tous les derniers messages pour chaque chat
      const chatIds = [...userChats.map(chat => chat._id), generalChat._id];

      // Utiliser une agrégation pour obtenir le dernier message de chaque chat
      const lastMessages = await Message.aggregate([
        { $match: { chat: { $in: chatIds.map(id => new mongoose.Types.ObjectId(id.toString())) } } },
        { $sort: { createdAt: -1 } },
        { $group: {
            _id: "$chat",
            lastMessage: { $first: "$$ROOT" },
            messageCount: { $sum: 1 },
            unreadCount: {
              $sum: {
                $cond: [
                  { $not: [{ $in: [new mongoose.Types.ObjectId(userId), "$readBy"] }] },
                  1,
                  0
                ]
              }
            }
          }
        },
        { $lookup: {
            from: "users",
            localField: "lastMessage.sender",
            foreignField: "_id",
            as: "sender"
          }
        },
        { $unwind: { path: "$sender", preserveNullAndEmptyArrays: true } }
      ]);

      // Créer un Map pour faciliter l'accès aux derniers messages par chatId
      const lastMessagesByChatId = new Map();
      lastMessages.forEach(msg => {
        // Déchiffrer le contenu du message (implémentation de votre service de chiffrement)
        const message = new Message(msg.lastMessage);
        const decryptedContent = message.getDecryptedContent();

        lastMessagesByChatId.set(msg._id.toString(), {
          ...msg,
          lastMessage: {
            ...msg.lastMessage,
            content: decryptedContent
          }
        });
      });

      // 6. Construire la réponse avec les membres, leur statut et le dernier message
      const directChats = userChats.filter(chat => chat.isDirectMessage);

      // Mapper les membres avec leurs informations de chat
      const result = filteredMembers.map(member => {
        // Trouver le chat direct avec ce membre s'il existe
        const chatWithMember = directChats.find(chat =>
          chat.participants.some(
            (participantId: any) =>
              member.user && participantId.toString() === member.user._id.toString()
          ) && chat.participants.length === 2
        );

        // Obtenir les infos du dernier message
        const chatId = chatWithMember ? chatWithMember._id.toString() : null;
        const lastMessageInfo = chatId ? lastMessagesByChatId.get(chatId) : null;

        return {
          _id: member._id,
          user: {
            _id: member.user?._id,
            username: member.user?.username || member.email,
            email: member.email,
            profilePicture: member.user?.profilePicture,
            name: member.user?.name
          },
          role: member.role,
          online: member.lastActive > new Date(Date.now() - 10 * 60 * 1000), // 10 minutes
          chatId: chatId,
          lastMessage: lastMessageInfo ? {
            _id: lastMessageInfo.lastMessage._id,
            content: lastMessageInfo.lastMessage.content,
            sender: {
              _id: lastMessageInfo.sender?._id,
              username: lastMessageInfo.sender?.username
            },
            createdAt: lastMessageInfo.lastMessage.createdAt,
            unread: lastMessageInfo.unreadCount > 0
          } : null,
          messageCount: lastMessageInfo?.messageCount || 0,
          unreadCount: lastMessageInfo?.unreadCount || 0
        };
      });

      // 7. Ajouter le chat général à la réponse
      const generalChatInfo = lastMessagesByChatId.get(generalChat._id.toString());

      return {
        members: result,
        generalChat: {
          _id: generalChat._id,
          name: generalChat.name,
          participants: generalChat.participants.length,
          lastMessage: generalChatInfo ? {
            _id: generalChatInfo.lastMessage._id,
            content: generalChatInfo.lastMessage.content,
            sender: {
              _id: generalChatInfo.sender?._id,
              username: generalChatInfo.sender?.username
            },
            createdAt: generalChatInfo.lastMessage.createdAt,
            unread: generalChatInfo.unreadCount > 0
          } : null,
          messageCount: generalChatInfo?.messageCount || 0,
          unreadCount: generalChatInfo?.unreadCount || 0
        }
      };
    } catch (error) {
      console.error("Error getting workspace chat members:", error);
      throw new Error("Failed to get workspace chat members");
    }
  }

  /**
   * Récupérer les statistiques de chat pour un utilisateur
   * (nombre total de messages, nombre de messages non lus, dernier message)
   */
  static async getUserChatStats(workspaceId: string, userId: string) {
    try {
      // 1. Récupérer tous les chats de l'utilisateur dans ce workspace
      const userChats = await Chat.find({
        workspace: workspaceId,
        participants: userId
      }).lean();

      // 2. Récupérer les statistiques pour chaque chat
      const chatIds = userChats.map(chat => chat._id);

      // Utiliser une agrégation pour obtenir les statistiques des chats
      const chatStats = await Message.aggregate([
        { $match: { chat: { $in: chatIds.map(id => new mongoose.Types.ObjectId(id.toString())) } } },
        { $group: {
            _id: "$chat",
            totalMessages: { $sum: 1 },
            unreadCount: {
              $sum: {
                $cond: [
                  { $not: [{ $in: [new mongoose.Types.ObjectId(userId), "$readBy"] }] },
                  1,
                  0
                ]
              }
            },
            lastMessageDate: { $max: "$createdAt" }
          }
        }
      ]);

      // 3. Calculer les totaux
      const totalStats = {
        totalChats: userChats.length,
        totalMessages: 0,
        totalUnread: 0,
        chatsWithUnread: 0
      };

      chatStats.forEach(stat => {
        totalStats.totalMessages += stat.totalMessages;
        totalStats.totalUnread += stat.unreadCount;
        if (stat.unreadCount > 0) {
          totalStats.chatsWithUnread += 1;
        }
      });

      return totalStats;
    } catch (error) {
      console.error("Error getting user chat stats:", error);
      throw new Error("Failed to get user chat statistics");
    }
  }
}

export default ChatMembersService;
