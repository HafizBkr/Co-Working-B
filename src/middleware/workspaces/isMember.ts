import { Request, Response, NextFunction } from "express";
import { WorkspaceRole } from "../../models/Workspace";

export const isMember = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.workspaceRole !== WorkspaceRole.MEMBER) {
    res.status(403).json({ message: "Member access required" });
    return;
  }
  next();
};
