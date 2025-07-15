import { Types } from "mongoose";

export type ObjectId = Types.ObjectId;

export const toObjectId = (id: string): ObjectId => new Types.ObjectId(id);
