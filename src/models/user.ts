import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    kMaxLength: 255,
    lowercase: true,
  },

  password: {
    type: String,
    required: true,
    kMaxLength: 255,
  },

  username: {
    type: String,
    required: true,
    kMaxLength: 255,
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

  createdAt: {
    type: Date,
    default: Date.now,
  },

  emailVerified: { type: Boolean, default: false },
  onlineStatus: { type: Boolean, default: false },
  videoEnabled: { type: Boolean, default: false },
  audioEnabled: { type: Boolean, default: false },
});

export const User = model("User", UserSchema);
export type UserDocument = Document & typeof UserSchema;
