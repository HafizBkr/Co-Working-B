import { Schema, model } from "mongoose";
import { kMaxLength } from "node:buffer";

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, kMaxLength: 255 },

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
