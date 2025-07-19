import { Request, Response } from "express";
import WorkspaceService from "../services/workspace.service";
import {
  RESPONSE_CODES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "../utils/error_response";

export class WorkspaceController {
  static async createWorkspace(req: Request, res: Response): Promise<void> {
    try {
      const workspaceData = req.body;
      const userId = req.user?.userId;

      console.log("Données reçues:", JSON.stringify(workspaceData, null, 2));
      console.log("User ID:", userId);

      if (!userId) {
        res.status(RESPONSE_CODES.UNAUTHORIZED).json({
          success: false,
          message: ERROR_MESSAGES.UNAUTHORIZED,
        });
        return;
      }

      const workspace = await WorkspaceService.createWorkspace(
        workspaceData,
        userId,
      );

      res.status(RESPONSE_CODES.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.WORKSPACE_CREATED,
        data: workspace,
      });
    } catch (error: any) {
      console.error("Create workspace error:", error);

      res.status(RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: error.message || ERROR_MESSAGES.WORKSPACE_NOT_FOUND,
      });
    }
  }

  static async getUserWorkspaces(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(RESPONSE_CODES.UNAUTHORIZED).json({
          success: false,
          message: ERROR_MESSAGES.UNAUTHORIZED,
        });
        return;
      }

      const workspaces = await WorkspaceService.getUserWorkspaces(userId);

      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message:
          SUCCESS_MESSAGES.WORKSPACES_FOUND ||
          "Workspaces récupérés avec succès.",
        data: workspaces,
      });
    } catch (error: any) {
      console.error("Get user workspaces error:", error);
      res.status(RESPONSE_CODES.SERVER_ERROR).json({
        success: false,
        message: error.message || ERROR_MESSAGES.WORKSPACE_NOT_FOUND,
      });
    }
  }

  static async getWorkspaceById(req: Request, res: Response): Promise<void> {
    try {
      const workspace = req.workspace;
      const workspaceMember = req.workspaceMember;

      if (!workspace) {
        res.status(RESPONSE_CODES.NOT_FOUND).json({
          success: false,
          message: ERROR_MESSAGES.WORKSPACE_NOT_FOUND,
        });
        return;
      }

      if (!workspaceMember || !workspaceMember.role) {
        res.status(RESPONSE_CODES.FORBIDDEN).json({
          success: false,
          message: ERROR_MESSAGES.ACCESS_DENIED,
        });
        return;
      }

      const role = workspaceMember.role;

      const workspaceDetails = await WorkspaceService.getWorkspaceDetails(
        workspace,
        role,
      );

      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message:
          SUCCESS_MESSAGES.WORKSPACE_FOUND || "Workspace récupéré avec succès.",
        data: workspaceDetails,
      });
    } catch (error: any) {
      console.error("Get workspace error:", error);
      res.status(RESPONSE_CODES.SERVER_ERROR).json({
        success: false,
        message: error.message || ERROR_MESSAGES.WORKSPACE_NOT_FOUND,
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

      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.WORKSPACE_UPDATED,
        data: updatedWorkspace,
      });
    } catch (error: any) {
      console.error("Update workspace error:", error);
      res.status(RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: error.message || ERROR_MESSAGES.WORKSPACE_NOT_FOUND,
      });
    }
  }

  static async deleteWorkspace(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = req.params.workspaceId;

      await WorkspaceService.deleteWorkspace(workspaceId);

      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.WORKSPACE_DELETED,
      });
    } catch (error: any) {
      console.error("Delete workspace error:", error);

      res.status(RESPONSE_CODES.SERVER_ERROR).json({
        success: false,
        message: error.message || ERROR_MESSAGES.WORKSPACE_NOT_FOUND,
      });
    }
  }
}
