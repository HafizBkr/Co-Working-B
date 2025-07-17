import { Request, Response, NextFunction } from "express";
import { WorkspaceRole } from "../../models/Workspace";

export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.workspaceRole === WorkspaceRole.ADMIN) {
    res.status(403).json({ message: "Admin Acess Required" });
    return;
  }
  next();
};
