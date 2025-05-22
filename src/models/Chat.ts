import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  name?: string;
  workspace: mongoose.Types.ObjectId;
  isDirectMessage: boolean;
  participants: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    name: { type: String, trim: true },
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    isDirectMessage: { type: Boolean, default: false },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export default mongoose.model<IChat>('Chat', chatSchema);
