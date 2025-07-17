import { WorkspaceRole } from "../../models/Workspace";
import { Request, Response, NextFunction } from "express";

export const isOwner = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.workspaceRole !== WorkspaceRole.OWNER) {
    res.status(403).json({ message: "Owner access required" });
    return;
  }
  next();
};
