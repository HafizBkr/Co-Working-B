import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDocument extends MongooseDocument {
  name: string;
  content: string;
  workspace: mongoose.Types.ObjectId;
  project?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  lastEditedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    name: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lastEditedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export default mongoose.model<IDocument>('Document', documentSchema);
