import { Request, Response, NextFunction } from "express";
import { WorkspaceRole } from "../../models/Workspace";

export const isGuest = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.workspaceRole !== WorkspaceRole.GUEST) {
    res.status(403).json({ message: "Guest access required" });
    return;
  }
  next();
};
