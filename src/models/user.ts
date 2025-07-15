import { Schema, Document, model } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  username: string;
  avatar?: string;
  bio?: string;
  location?: string;
  emailVerified: boolean;
  onlineStatus: boolean;
  videoEnabled: boolean;
  audioEnabled: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    maxlength: 255,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    maxlength: 255,
  },
  username: {
    type: String,
    required: true,
    maxlength: 255,
  },
  avatar: {
    type: String,
  },
  bio: {
    type: String,
  },
  location: {
    type: String,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  onlineStatus: {
    type: Boolean,
    default: false,
  },
  videoEnabled: {
    type: Boolean,
    default: false,
  },
  audioEnabled: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = model<IUser>("User", UserSchema);
