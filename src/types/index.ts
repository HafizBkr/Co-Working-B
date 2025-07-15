import mongoose from 'mongoose';
import { WorkspaceRole } from '../models/Workspace';
import { IUser } from '../models/user';

export interface Position {
  x: number;
  y: number;
}

export interface BaseResponse {
  success: boolean;
  message: string;
}

export interface InvitationResponse extends BaseResponse {
  reinvited?: boolean;
  invited?: boolean;
  email: string;
}

export interface RegistrationResponse extends BaseResponse {
  userId: mongoose.Types.ObjectId;
  email: string;
  needEmailVerification: boolean;
}

export interface WorkspaceInvitationData {
  email: string;
  workspace: mongoose.Types.ObjectId;
  role: WorkspaceRole;
  invitedBy: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'waiting_verification';
}

export interface WorkspaceMemberData {
  workspace: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  email: string;
  role: WorkspaceRole;
  invitedBy: mongoose.Types.ObjectId;
  inviteAccepted: boolean;
  currentPosition?: Position;
  lastActive?: Date;
}

export interface PopulatedWorkspaceMember extends Omit<WorkspaceMemberData, 'user'> {
  _id: mongoose.Types.ObjectId;
  user: Pick<IUser, '_id' | 'email' | 'username' | 'avatar'>;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRegistrationData {
  email: string;
  password: string;
  username: string;
  avatar?: string;
  bio?: string;
  location?: string;
}

export type MongooseId = string | mongoose.Types.ObjectId;
