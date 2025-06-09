import { Document } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string };
      workspace?: any;
      workspaceMember?: any;
    }
  }
}

export interface WorkspaceData extends Document {
  name: string;
}
