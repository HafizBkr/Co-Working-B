import mongoose, { Schema, Document } from "mongoose";
import { WorkspaceRole } from "./Workspace";

export interface IWorkspaceInvitation extends Document {
  email: string;
  workspace: mongoose.Types.ObjectId;
  role: WorkspaceRole;
  invitedBy: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  status:
    | "pending"
    | "accepted"
    | "rejected"
    | "expired"
    | "waiting_verification";
  createdAt: Date;
  updatedAt: Date;
}

const workspaceInvitationSchema = new Schema<IWorkspaceInvitation>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(WorkspaceRole),
      default: WorkspaceRole.MEMBER,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "expired",
        "waiting_verification",
      ],
      default: "pending",
    },
  },
  { timestamps: true },
);

// Index pour accélérer la recherche (plus unique)
workspaceInvitationSchema.index({ workspace: 1, email: 1 });

// Index for token lookups
workspaceInvitationSchema.index({ token: 1 }, { unique: true });

// Index for expiry cleanup
workspaceInvitationSchema.index({ expiresAt: 1 });

const WorkspaceInvitation = mongoose.model<IWorkspaceInvitation>(
  "WorkspaceInvitation",
  workspaceInvitationSchema,
);

export default WorkspaceInvitation;
