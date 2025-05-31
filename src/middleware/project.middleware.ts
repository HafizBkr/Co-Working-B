import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import projectRepository from "../repository/project.repository";
import WorkspaceMemberRepository from "../repository/workspace-member.repository";

declare global {
  namespace Express {
    interface Request {
      project?: any;
    }
  }
}

export const hasProjectAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const projectId = req.params.projectId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      res.status(400).json({ message: "Invalid project ID" });
      return;
    }

    const project = await projectRepository.findById(projectId);
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    const workspaceId =
      typeof project.workspace === "object" && project.workspace._id
        ? project.workspace._id.toString()
        : project.workspace.toString();

    const membership = await WorkspaceMemberRepository.findMembership(
      workspaceId,
      userId,
    );

    if (!membership || !membership.inviteAccepted) {
      res
        .status(403)
        .json({ message: "You do not have access to this project" });
      return;
    }

    req.project = project;
    req.workspaceMember = membership;

    next();
  } catch (error) {
    console.error("Project access check error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
