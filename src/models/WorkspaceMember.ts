import mongoose, { Schema, Document } from "mongoose";
import { WorkspaceRole } from "./Workspace";

export interface IWorkspaceMember extends Document {
  workspace: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId; // Rendre optionnel
  email: string; // Email toujours requis
  role: WorkspaceRole;
  invitedBy: mongoose.Types.ObjectId;
  inviteAccepted: boolean;
  currentPosition?: { x: number; y: number };
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

const workspaceMemberSchema = new Schema<IWorkspaceMember>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User" }, // Optionnel
    email: { type: String, required: true, lowercase: true, trim: true }, // Toujours requis
    role: {
      type: String,
      enum: Object.values(WorkspaceRole),
      default: WorkspaceRole.MEMBER,
    },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    inviteAccepted: { type: Boolean, default: false },
    currentPosition: {
      x: { type: Number },
      y: { type: Number },
    },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Index modifié pour permettre plusieurs invitations pour le même email mais dans différents workspaces
workspaceMemberSchema.index({ workspace: 1, email: 1 }, { unique: true });

export default mongoose.model<IWorkspaceMember>(
  "WorkspaceMember",
  workspaceMemberSchema,
);
