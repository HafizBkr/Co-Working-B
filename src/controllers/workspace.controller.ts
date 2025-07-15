import { Request, Response } from "express";
import WorkspaceService from "../services/workspace.service";

export class WorkspaceController {
  static async createWorkspace(req: Request, res: Response): Promise<void> {
    try {
      const workspaceData = req.body;
      const userId = req.user?.userId;

      console.log("Données reçues:", JSON.stringify(workspaceData, null, 2));
      console.log("User ID:", userId);

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User ID is required",
        });
        return;
      }

      const workspace = await WorkspaceService.createWorkspace(
        workspaceData,
        userId,
      );

      res.status(201).json({
        success: true,
        data: workspace,
      });
    } catch (error: any) {
      console.error("Create workspace error:", error);

      res.status(400).json({
        success: false,
        message: error.message || "Failed to create workspace",
      });
    }
  }

  static async getUserWorkspaces(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User ID is required",
        });
        return;
      }

      const workspaces = await WorkspaceService.getUserWorkspaces(userId);

      res.status(200).json({
        success: true,
        data: workspaces,
      });
    } catch (error: any) {
      console.error("Get user workspaces error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get workspaces",
      });
    }
  }

  static async getWorkspaceById(req: Request, res: Response): Promise<void> {
    try {
      const workspace = req.workspace;
      const workspaceMember = req.workspaceMember;

      if (!workspace) {
        res.status(404).json({
          success: false,
          message: "Workspace not found",
        });
        return;
      }

      if (!workspaceMember || !workspaceMember.role) {
        res.status(403).json({
          success: false,
          message: "Workspace member or role not found",
        });
        return;
      }

      const role = workspaceMember.role;

      const workspaceDetails = await WorkspaceService.getWorkspaceDetails(
        workspace,
        role,
      );

      res.status(200).json({
        success: true,
        data: workspaceDetails,
      });
    } catch (error: any) {
      console.error("Get workspace error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get workspace",
      });
    }
  }

  static async updateWorkspace(req: Request, res: Response): Promise<void> {
    try {
      const updateData = req.body;
      const workspaceId = req.params.workspaceId;

      const updatedWorkspace = await WorkspaceService.updateWorkspace(
        workspaceId,
        updateData,
      );

      res.status(200).json({
        success: true,
        data: updatedWorkspace,
      });
    } catch (error: any) {
      console.error("Update workspace error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update workspace",
      });
    }
  }

  static async deleteWorkspace(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = req.params.workspaceId;

      await WorkspaceService.deleteWorkspace(workspaceId);

      res.status(200).json({
        success: true,
        message: "Workspace deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete workspace error:", error);

      res.status(500).json({
        success: false,
        message: error.message || "Failed to delete workspace",
      });
    }
  }
}
