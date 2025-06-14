import mongoose, { Schema, Document, CallbackError } from "mongoose";
import { EncryptionService } from "../utils/encryption";

export interface IMessage extends Document {
  chat: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  attachments?: string[];
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;

  getDecryptedContent(): string;
  setEncryptedContent(content: string): void;
}

const messageSchema = new Schema<IMessage>(
  {
    chat: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    attachments: [{ type: String }],
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

messageSchema.pre("save", function (next) {
  if (
    this.isModified("content") &&
    !EncryptionService.isEncrypted(this.content)
  ) {
    try {
      this.content = EncryptionService.encrypt(this.content);
    } catch (error) {
      console.error("Erreur lors du chiffrement:", error);
      return next(error as CallbackError);
    }
  }
  next();
});

messageSchema.pre(["updateOne", "findOneAndUpdate"], function (next) {
  const update = this.getUpdate() as any;
  if (
    update &&
    update.content &&
    !EncryptionService.isEncrypted(update.content)
  ) {
    try {
      update.content = EncryptionService.encrypt(update.content);
    } catch (error) {
      console.error("Erreur lors du chiffrement:", error);
      return next(error as CallbackError);
    }
  }
  next();
});

messageSchema.methods.getDecryptedContent = function (): string {
  try {
    if (EncryptionService.isEncrypted(this.content)) {
      return EncryptionService.decrypt(this.content);
    }
    return this.content;
  } catch (error) {
    console.error("Erreur lors du déchiffrement:", error);
    return "[Message illisible]";
  }
};

messageSchema.methods.setEncryptedContent = function (content: string): void {
  this.content = EncryptionService.encrypt(content);
};

export default mongoose.model<IMessage>("Message", messageSchema);
