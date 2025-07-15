import { Request, Response } from "express";
import ChatMembersService from "../services/chat-members.service";

export class ChatMembersController {
  /**
   * Récupère tous les membres avec qui l'utilisateur peut discuter dans un workspace
   * Inclut le chat général et les derniers messages
   */
  static async getWorkspaceChatMembers(req: Request, res: Response): Promise<void> {
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

      const chatMembers = await ChatMembersService.getWorkspaceChatMembers(workspaceId, userId);

      res.status(200).json({
        success: true,
        data: chatMembers,
      });
    } catch (error: any) {
      console.error("Get workspace chat members error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get workspace chat members",
      });
    }
  }

  /**
   * Récupère les statistiques de chat pour un utilisateur
   */
  static async getUserChatStats(req: Request, res: Response): Promise<void> {
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

      const chatStats = await ChatMembersService.getUserChatStats(workspaceId, userId);

      res.status(200).json({
        success: true,
        data: chatStats,
      });
    } catch (error: any) {
      console.error("Get user chat stats error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get user chat statistics",
      });
    }
  }
}

export default ChatMembersController;
