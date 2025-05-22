import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { config } from "../configs/configs";
import WorkspaceMemberService from "./workspace-member.service";

interface UserSocket {
  userId: string;
  socketId: string;
  workspaceId?: string;
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
    // Middleware for authentication
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
    };
    this.activeUsers.push(user);

    // Join workspace event
    socket.on("join-workspace", async (workspaceId) => {
      this.handleJoinWorkspace(socket, workspaceId);
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
    socket.on("send-message", (data) => {
      this.handleSendMessage(socket, data);
    });

    // Start typing event
    socket.on("typing-start", (data) => {
      this.handleTypingStart(socket, data);
    });

    // Stop typing event
    socket.on("typing-stop", (data) => {
      this.handleTypingStop(socket, data);
    });

    // Disconnect event
    socket.on("disconnect", () => {
      this.handleDisconnect(socket);
    });
  }

  private async handleJoinWorkspace(socket: Socket, workspaceId: string) {
    try {
      // Update the workspace in user data
      const userIndex = this.activeUsers.findIndex(
        (u) => u.socketId === socket.id,
      );
      if (userIndex !== -1) {
        this.activeUsers[userIndex].workspaceId = workspaceId;
      }

      // Join the workspace room
      socket.join(`workspace-${workspaceId}`);

      // Broadcast active users to the workspace
      const activeUsers =
        await WorkspaceMemberService.getActiveWorkspaceUsers(workspaceId);
      this.io.to(`workspace-${workspaceId}`).emit("active-users", activeUsers);
    } catch (error) {
      socket.emit("error", "Failed to join workspace");
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
      this.io.to(`workspace-${workspaceId}`).emit("user-position", {
        userId: socket.data.userId,
        position,
      });
    } catch (error) {
      socket.emit("error", "Failed to update position");
    }
  }

  private handleSendMessage(
    socket: Socket,
    data: { chatId: string; content: string; attachments?: string[] },
  ) {
    try {
      const { chatId, content, attachments } = data;

      // Broadcast message to chat room
      this.io.to(`chat-${chatId}`).emit("new-message", {
        chatId,
        sender: socket.data.userId,
        content,
        attachments,
        timestamp: new Date(),
      });

      // Note: In a real implementation, you would save the message to the database here
      // through a MessageService or repository
    } catch (error) {
      socket.emit("error", "Failed to send message");
    }
  }

  private handleTypingStart(socket: Socket, data: { chatId: string }) {
    try {
      const { chatId } = data;

      // Broadcast typing status to chat room except the sender
      socket.to(`chat-${chatId}`).emit("user-typing", {
        chatId,
        userId: socket.data.userId,
      });
    } catch (error) {
      socket.emit("error", "Failed to update typing status");
    }
  }

  private handleTypingStop(socket: Socket, data: { chatId: string }) {
    try {
      const { chatId } = data;

      // Broadcast typing stopped to chat room except the sender
      socket.to(`chat-${chatId}`).emit("user-stopped-typing", {
        chatId,
        userId: socket.data.userId,
      });
    } catch (error) {
      socket.emit("error", "Failed to update typing status");
    }
  }

  private handleDisconnect(socket: Socket) {
    const userIndex = this.activeUsers.findIndex(
      (u) => u.socketId === socket.id,
    );

    if (userIndex !== -1) {
      const workspaceId = this.activeUsers[userIndex].workspaceId;

      // Remove user from active users
      this.activeUsers.splice(userIndex, 1);

      // Notify workspace that user disconnected
      if (workspaceId) {
        this.io
          .to(`workspace-${workspaceId}`)
          .emit("user-disconnected", socket.data.userId);
      }
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
}

export default RealtimeService;
