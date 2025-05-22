import { Request, Response } from "express";
import WorkspaceService from "../services/workspace.service";

export const createWorkspace = async (req: Request, res: Response) => {
  try {
    const workspaceData = req.body;
    const userId = req.user?.userId;

    // Debug: Ajoutez ces lignes pour diagnostiquer le problème
    console.log("Données reçues:", JSON.stringify(workspaceData, null, 2));
    console.log("User ID:", userId);

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
};

export const getUserWorkspaces = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const workspaces = await WorkspaceService.getUserWorkspaces(
      userId as string,
    );

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
};

export const getWorkspaceById = async (req: Request, res: Response) => {
  try {
    const workspace = req.workspace;
    const role = req.workspaceMember.role;

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
};

export const updateWorkspace = async (req: Request, res: Response) => {
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
};

export const deleteWorkspace = async (req: Request, res: Response) => {
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
};
