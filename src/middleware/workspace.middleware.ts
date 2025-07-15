import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import WorkspaceRepository from "../repository/workspace.repository";
import WorkspaceMemberRepository from "../repository/workspace-member.repository";
import WorkspaceService from "../services/workspace.service";

// Extend Request interface to include workspace info
declare global {
  namespace Express {
    interface Request {
      workspace?: any;
      workspaceMember?: any;
    }
  }
}

// Check if user has access to the workspace
export const hasWorkspaceAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const workspaceId = req.params.workspaceId;

    // Validate workspaceId format
    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      res.status(400).json({ message: "Invalid workspace ID" });
      return;
    }

    // Find the workspace
    const workspace = await WorkspaceRepository.findById(workspaceId);
    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    // Check if user is a member of the workspace
    const membership = await WorkspaceMemberRepository.findMembership(
      workspaceId,
      req.user?.userId ?? "",
    );

    if (!membership || !membership.inviteAccepted) {
      res
        .status(403)
        .json({ message: "You do not have access to this workspace" });
      return;
    }

    // Attach workspace and membership to request object
    req.workspace = workspace;
    req.workspaceMember = membership;

    next();
  } catch (error) {
    console.error("Workspace access check error:", error);
    res.status(500).json({ message: "Server error" });
    return;
  }
};

// Check if user has admin access to the workspace
export const hasAdminAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (
    !req.workspaceMember ||
    !WorkspaceService.hasAdminAccess(req.workspaceMember.role)
  ) {
    res.status(403).json({ message: "Admin access required" });
    return;
  }
  next();
};