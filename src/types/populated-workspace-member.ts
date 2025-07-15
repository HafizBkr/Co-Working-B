import { ObjectId } from "mongoose";
import { WorkspaceRole } from "../models/Workspace";
import { IUser } from "../models/user";

export interface PopulatedWorkspaceMember {
  _id: ObjectId;
  workspace: ObjectId | { _id: ObjectId; name?: string };
  user?: IUser;
  email: string;
  role: WorkspaceRole;
  invitedBy: ObjectId | { _id: ObjectId; email?: string };
  inviteAccepted: boolean;
  currentPosition?: { x: number; y: number };
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}
