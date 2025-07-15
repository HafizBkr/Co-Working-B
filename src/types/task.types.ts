import { ITask } from "../models/Task";

export type PopulatedUser = {
  email: string;
  username: string;
  avatar?: string;
};

export type PopulatedTask = Omit<ITask, "assignedTo" | "createdBy"> & {
  assignedTo?: PopulatedUser;
  createdBy?: PopulatedUser;
};
