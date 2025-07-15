import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { config } from "../configs/configs";
import WorkspaceMemberService from "./workspace-member.service";
import ChatService from "./chat.service";

interface UserSocket {
  userId: string;
  socketId: string;
  workspaceId?: string;
  activeChats: string[];
<<<<<<< HEAD
=======
  lastSeen: Date;
>>>>>>> 53f2f0fa9675c95da4d412b46494516a375ac650
}

export class RealtimeService {
  private io: Server;
  private activeUsers: UserSocket[] = [];

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.initializeSocketHandlers();
  }

  private initializeSocketHandlers() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          return next(new Error("Authentication error"));
        }

        const decoded = jwt.verify(token, config.jwtSecret) as {
          userId: string;
        };
        socket.data.userId = decoded.userId;
        next();
      } catch (error) {
        next(new Error("Authentication error"));
      }
    });

    this.io.on("connection", (socket) => {
      this.handleConnection(socket);
    });
  }

  private handleConnection(socket: Socket) {
    console.log(`User connected: ${socket.data.userId}`);

    // Add user to active users
    const user: UserSocket = {
      userId: socket.data.userId,
      socketId: socket.id,
      activeChats: [],
<<<<<<< HEAD
=======
      lastSeen: new Date(),
>>>>>>> 53f2f0fa9675c95da4d412b46494516a375ac650
    };
    this.activeUsers.push(user);

    // Join workspace event
    socket.on("join-workspace", async (workspaceId) => {
      this.handleJoinWorkspace(socket, workspaceId);
    });

    // Join chat event
    socket.on("join-chat", async (chatId) => {
      this.handleJoinChat(socket, chatId);
    });

    // Leave chat event
    socket.on("leave-chat", async (chatId) => {
      this.handleLeaveChat(socket, chatId);
    });

    // Update user position event
    socket.on("update-position", async (data) => {
      this.handleUpdatePosition(socket, data);
    });

    // Join voice chat event
    socket.on("join-voice-chat", (chatId) => {
      socket.join(`voice-${chatId}`);
      this.io
        .to(`voice-${chatId}`)
        .emit("user-joined-voice", socket.data.userId);
    });

    // Leave voice chat event
    socket.on("leave-voice-chat", (chatId) => {
      socket.leave(`voice-${chatId}`);
      this.io.to(`voice-${chatId}`).emit("user-left-voice", socket.data.userId);
    });

    // Chat message event
    socket.on("send-message", async (data) => {
      await this.handleSendMessage(socket, data);
    });

    // Start typing event
    socket.on("typing-start", (data) => {
      this.handleTypingStart(socket, data);
    });

    // Stop typing event
    socket.on("typing-stop", (data) => {
      this.handleTypingStop(socket, data);
    });

    // Update message event
    socket.on("update-message", async (data) => {
      await this.handleUpdateMessage(socket, data);
    });

    // Delete message event
    socket.on("delete-message", async (data) => {
      await this.handleDeleteMessage(socket, data);
    });

    // Disconnect event
    socket.on("disconnect", () => {
      this.handleDisconnect(socket);
    });
  }

  private async handleJoinWorkspace(socket: Socket, workspaceId: string) {
    try {
      // Vérifier si l'utilisateur a accès au workspace
      const hasAccess = await WorkspaceMemberService.userHasAccessToWorkspace(
        workspaceId,
        socket.data.userId,
      );

      if (!hasAccess) {
        socket.emit("error", "You don't have access to this workspace");
        return;
      }

      // Update the workspace in user data
      const userIndex = this.activeUsers.findIndex(
        (u) => u.socketId === socket.id,
      );
      if (userIndex !== -1) {
        this.activeUsers[userIndex].workspaceId = workspaceId;
<<<<<<< HEAD
=======
        this.activeUsers[userIndex].lastSeen = new Date();
>>>>>>> 53f2f0fa9675c95da4d412b46494516a375ac650
      }

      // Join the workspace room
      socket.join(`workspace-${workspaceId}`);

      // Broadcast active users to the workspace
      const activeUsers =
        await WorkspaceMemberService.getActiveWorkspaceUsers(workspaceId);
      this.io.to(`workspace-${workspaceId}`).emit("active-users", activeUsers);

      socket.emit("workspace-joined", { workspaceId });
    } catch (error) {
      console.error("Join workspace error:", error);
      socket.emit("error", "Failed to join workspace");
    }
  }

  private async handleJoinChat(socket: Socket, chatId: string) {
    try {
      // Vérifier si l'utilisateur a accès au chat
      const hasAccess = await ChatService.userHasAccessToChat(
        chatId,
        socket.data.userId,
      );

      if (!hasAccess) {
        socket.emit("error", "You don't have access to this chat");
        return;
      }

      // Join the chat room
      socket.join(`chat-${chatId}`);

      // Update user's active chats
      const userIndex = this.activeUsers.findIndex(
        (u) => u.socketId === socket.id,
      );
      if (userIndex !== -1) {
        if (!this.activeUsers[userIndex].activeChats.includes(chatId)) {
          this.activeUsers[userIndex].activeChats.push(chatId);
        }
<<<<<<< HEAD
=======
        this.activeUsers[userIndex].lastSeen = new Date();
>>>>>>> 53f2f0fa9675c95da4d412b46494516a375ac650
      }

      // Notify others that user joined the chat
      socket.to(`chat-${chatId}`).emit("user-joined-chat", {
        chatId,
        userId: socket.data.userId,
      });

      socket.emit("chat-joined", { chatId });
    } catch (error) {
      console.error("Join chat error:", error);
      socket.emit("error", "Failed to join chat");
    }
  }

  private async handleLeaveChat(socket: Socket, chatId: string) {
    try {
      // Leave the chat room
      socket.leave(`chat-${chatId}`);

      // Update user's active chats
      const userIndex = this.activeUsers.findIndex(
        (u) => u.socketId === socket.id,
      );
      if (userIndex !== -1) {
        this.activeUsers[userIndex].activeChats = this.activeUsers[
          userIndex
        ].activeChats.filter((id) => id !== chatId);
<<<<<<< HEAD
=======
        this.activeUsers[userIndex].lastSeen = new Date();
>>>>>>> 53f2f0fa9675c95da4d412b46494516a375ac650
      }

      // Notify others that user left the chat
      socket.to(`chat-${chatId}`).emit("user-left-chat", {
        chatId,
        userId: socket.data.userId,
      });

      socket.emit("chat-left", { chatId });
    } catch (error) {
      console.error("Leave chat error:", error);
      socket.emit("error", "Failed to leave chat");
    }
  }

  private async handleUpdatePosition(
    socket: Socket,
    data: { workspaceId: string; position: { x: number; y: number } },
  ) {
    try {
      const { workspaceId, position } = data;

      // Update user position in database
      await WorkspaceMemberService.updateUserPosition(
        workspaceId,
        socket.data.userId,
        position,
      );

      // Broadcast position update to workspace
      socket.to(`workspace-${workspaceId}`).emit("user-position", {
        userId: socket.data.userId,
        position,
      });
    } catch (error) {
      console.error("Update position error:", error);
      socket.emit("error", "Failed to update position");
    }
  }

  private async handleSendMessage(
    socket: Socket,
    data: {
      chatId: string;
      content: string;
      attachments?: string[];
      tempId?: string;
    },
  ) {
    try {
      const { chatId, content, attachments, tempId } = data;

      // Vérifier si l'utilisateur a accès au chat
      const hasAccess = await ChatService.userHasAccessToChat(
        chatId,
        socket.data.userId,
      );

      if (!hasAccess) {
        socket.emit("error", "You don't have access to this chat");
        return;
      }

      // Sauvegarder le message en base de données
      const savedMessage = await ChatService.sendMessage(
        chatId,
        socket.data.userId,
        content,
        attachments,
      );

      // Broadcast message to chat room
      this.io.to(`chat-${chatId}`).emit("new-message", {
        ...savedMessage,
        timestamp: new Date(),
      });

<<<<<<< HEAD
=======
      // Broadcast last message update to workspace members
      const chat = await ChatService.getChatById(chatId);
      if (chat && chat.workspace) {
        this.broadcastToWorkspace(chat.workspace.toString(), "chat-updated", {
          chatId,
          lastMessage: {
            _id: savedMessage._id,
            content: savedMessage.content,
            sender: savedMessage.sender,
            createdAt: savedMessage.createdAt,
          },
        });
      }

>>>>>>> 53f2f0fa9675c95da4d412b46494516a375ac650
      // Confirmation à l'expéditeur
      socket.emit("message-sent", {
        messageId: savedMessage._id,
        chatId,
        tempId, // Pour la synchronisation côté client
      });
    } catch (error) {
      console.error("Send message error:", error);
      socket.emit("error", "Failed to send message");
    }
  }

  private async handleUpdateMessage(
    socket: Socket,
    data: { messageId: string; content: string },
  ) {
    try {
      const { messageId, content } = data;

      // Utiliser le service ChatService pour mettre à jour le message
      const updatedMessage = await ChatService.updateMessage(
        messageId,
        socket.data.userId,
        content,
      );

      // Le broadcast est déjà géré dans ChatService.updateMessage
      // Confirmation à l'expéditeur
      socket.emit("message-updated-success", {
        messageId,
        updatedMessage,
      });
<<<<<<< HEAD
=======

      // Mettre à jour le dernier message pour tous les membres du workspace
      const chat = await ChatService.getChatById(
        updatedMessage.chat.toString(),
      );
      if (chat && chat.workspace) {
        this.broadcastToWorkspace(chat.workspace.toString(), "chat-updated", {
          chatId: updatedMessage.chat.toString(),
          lastMessage: {
            _id: updatedMessage._id,
            content: updatedMessage.content,
            sender: updatedMessage.sender,
            createdAt: updatedMessage.createdAt,
            updatedAt: updatedMessage.updatedAt,
          },
        });
      }
>>>>>>> 53f2f0fa9675c95da4d412b46494516a375ac650
    } catch (error) {
      console.error("Update message error:", error);
      socket.emit("error", error.message || "Failed to update message");
    }
  }

  private async handleDeleteMessage(
    socket: Socket,
    data: { messageId: string; soft?: boolean },
  ) {
    try {
      const { messageId, soft = false } = data;

      let result;
      if (soft) {
        result = await ChatService.softDeleteMessage(
          messageId,
          socket.data.userId,
        );
      } else {
        result = await ChatService.deleteMessage(messageId, socket.data.userId);
      }

      // Le broadcast est déjà géré dans ChatService
      // Confirmation à l'expéditeur
      socket.emit("message-deleted-success", {
        messageId,
        result,
      });
<<<<<<< HEAD
=======

      // Mettre à jour le dernier message pour tous les membres du workspace si nécessaire
      if (result.chatId) {
        const chat = await ChatService.getChatById(result.chatId);
        if (chat && chat.workspace) {
          // Récupérer le nouveau dernier message
          const lastMessage = await ChatService.updateChatLastMessage(
            result.chatId,
          );
          if (lastMessage) {
            this.broadcastToWorkspace(
              chat.workspace.toString(),
              "chat-updated",
              {
                chatId: result.chatId,
                lastMessage: {
                  _id: lastMessage._id,
                  content: lastMessage.getDecryptedContent(),
                  sender: lastMessage.sender,
                  createdAt: lastMessage.createdAt,
                },
              },
            );
          }
        }
      }
>>>>>>> 53f2f0fa9675c95da4d412b46494516a375ac650
    } catch (error) {
      console.error("Delete message error:", error);
      socket.emit("error", error.message || "Failed to delete message");
    }
  }

  private handleTypingStart(socket: Socket, data: { chatId: string }) {
    try {
      const { chatId } = data;

      // Vérifier que l'utilisateur est dans le chat
      const user = this.activeUsers.find((u) => u.socketId === socket.id);
      if (!user || !user.activeChats.includes(chatId)) {
        socket.emit("error", "You are not in this chat");
        return;
      }

      // Broadcast typing status to chat room except the sender
      socket.to(`chat-${chatId}`).emit("user-typing", {
        chatId,
        userId: socket.data.userId,
      });
    } catch (error) {
      console.error("Typing start error:", error);
      socket.emit("error", "Failed to update typing status");
    }
  }

  private handleTypingStop(socket: Socket, data: { chatId: string }) {
    try {
      const { chatId } = data;

      // Vérifier que l'utilisateur est dans le chat
      const user = this.activeUsers.find((u) => u.socketId === socket.id);
      if (!user || !user.activeChats.includes(chatId)) {
        return; // Pas d'erreur ici, l'utilisateur a pu quitter le chat
      }

      // Broadcast typing stopped to chat room except the sender
      socket.to(`chat-${chatId}`).emit("user-stopped-typing", {
        chatId,
        userId: socket.data.userId,
      });
    } catch (error) {
      console.error("Typing stop error:", error);
      socket.emit("error", "Failed to update typing status");
    }
  }

  private handleDisconnect(socket: Socket) {
    const userIndex = this.activeUsers.findIndex(
      (u) => u.socketId === socket.id,
    );

    if (userIndex !== -1) {
      const user = this.activeUsers[userIndex];
<<<<<<< HEAD
=======
      user.lastSeen = new Date(); // Mettre à jour le dernier moment de présence
>>>>>>> 53f2f0fa9675c95da4d412b46494516a375ac650
      const { workspaceId, activeChats } = user;

      // Notify all active chats that user disconnected
      activeChats.forEach((chatId) => {
        socket.to(`chat-${chatId}`).emit("user-left-chat", {
          chatId,
          userId: socket.data.userId,
        });
      });

      // Notify workspace that user disconnected
      if (workspaceId) {
        this.io
          .to(`workspace-${workspaceId}`)
          .emit("user-disconnected", socket.data.userId);
      }

      // Remove user from active users
      this.activeUsers.splice(userIndex, 1);
    }

    console.log(`User disconnected: ${socket.data.userId}`);
  }

  // Public methods for external communication

  /**
   * Broadcast a message to all users in a workspace
   */
  public broadcastToWorkspace(workspaceId: string, event: string, data: any) {
    this.io.to(`workspace-${workspaceId}`).emit(event, data);
  }

  /**
   * Send a message to a specific user
   */
  public sendToUser(userId: string, event: string, data: any) {
    const user = this.activeUsers.find((u) => u.userId === userId);
    if (user) {
      this.io.to(user.socketId).emit(event, data);
    }
  }

  /**
   * Send a message to all users in a chat room
   */
  public broadcastToChat(chatId: string, event: string, data: any) {
    this.io.to(`chat-${chatId}`).emit(event, data);
  }

  /**
   * Get all active users in a workspace
   */
  public getActiveWorkspaceUsers(workspaceId: string) {
    return this.activeUsers
      .filter((user) => user.workspaceId === workspaceId)
      .map((user) => user.userId);
  }

  /**
   * Get all active users in a chat
   */
  public getActiveChatUsers(chatId: string) {
    return this.activeUsers
      .filter((user) => user.activeChats.includes(chatId))
      .map((user) => user.userId);
  }

  /**
   * Force a user to leave a chat (for moderation)
   */
  public forceLeaveChat(userId: string, chatId: string) {
    const user = this.activeUsers.find((u) => u.userId === userId);
    if (user) {
      const socket = this.io.sockets.sockets.get(user.socketId);
      if (socket) {
        socket.leave(`chat-${chatId}`);
        socket.emit("forced-leave-chat", { chatId, reason: "Moderation" });
      }
      // Update user's active chats
      user.activeChats = user.activeChats.filter((id) => id !== chatId);
    }
  }
}

export default RealtimeService;
