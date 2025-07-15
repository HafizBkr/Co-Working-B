import mongoose, { Document } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string };
      workspace?: any;
      workspaceMember?: any;
      chat?: {
        participants: mongoose.Types.ObjectId[];
        workspace: mongoose.Types.ObjectId;
      };
    }
  }
}

export interface WorkspaceData extends Document {
  name: string;
}
