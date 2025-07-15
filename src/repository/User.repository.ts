import mongoose, { Document, Model } from "mongoose";
import { BaseRepository } from "./base.repository";
import { User } from "../models/user";
import { hashPassword, comparePassword } from "../utils/hash";
import { createAndSendOTP } from "../utils/otp";

export interface IUserDocument extends Document {
  email: string;
  password: string;
  username: string;
  avatar?: string;
  bio?: string;
  location?: string;
  createdAt: Date;
  emailVerified: boolean;
  onlineStatus: boolean;
  videoEnabled: boolean;
  audioEnabled: boolean;
}

export class UserRepository extends BaseRepository<IUserDocument> {
  constructor() {
    super(User as unknown as Model<IUserDocument>);
  }

  async register(userData: {
    email: string;
    password: string;
    username: string;
    avatar?: string;
    bio?: string;
    location?: string;
  }): Promise<IUserDocument | null> {
    const existingUser = await this.findOne({ email: userData.email });
    if (existingUser) {
      return null;
    }
    const hashedPassword = await hashPassword(userData.password);

    const user = await this.create({
      ...userData,
      password: hashedPassword,
      emailVerified: false,
      onlineStatus: false,
      videoEnabled: false,
      audioEnabled: false,
      createdAt: new Date(),
    });

    await createAndSendOTP(user.email);

    return user;
  }

  async login(email: string, password: string): Promise<IUserDocument | null> {
    const user = await this.findOne({ email });
    if (!user) {
      return null;
    }
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    user.onlineStatus = true;
    await user.save();
    return user;
  }
}
