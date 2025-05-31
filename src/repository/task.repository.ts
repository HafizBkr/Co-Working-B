import { BaseRepository, IBaseRepository } from "./base.repository";
import Task, { ITask } from "../models/Task";

const USER_POPULATE = [
  { path: "assignedTo", select: "email username avatar" },
  { path: "createdBy", select: "email username avatar" },
];

export interface ITaskRepository extends IBaseRepository<ITask> {
  findByProject(projectId: string): Promise<ITask[]>;
  findByWorkspace(workspaceId: string): Promise<ITask[]>;
  findByAssignedTo(userId: string): Promise<ITask[]>;
  findByStatus(status: string): Promise<ITask[]>;
  findByIdPopulated(id: string): Promise<ITask | null>;
}

export class TaskRepository
  extends BaseRepository<ITask>
  implements ITaskRepository
{
  constructor() {
    super(Task);
  }

  async findByProject(projectId: string): Promise<ITask[]> {
    return this.model
      .find({ project: projectId })
      .populate(USER_POPULATE)
      .exec();
  }

  async findByWorkspace(workspaceId: string): Promise<ITask[]> {
    return this.model
      .find({ workspace: workspaceId })
      .populate(USER_POPULATE)
      .exec();
  }

  async findByAssignedTo(userId: string): Promise<ITask[]> {
    return this.model
      .find({ assignedTo: userId })
      .populate(USER_POPULATE)
      .exec();
  }

  async findByStatus(status: string): Promise<ITask[]> {
    return this.model.find({ status }).populate(USER_POPULATE).exec();
  }

  async findByIdPopulated(id: string): Promise<ITask | null> {
    return this.model.findById(id).populate(USER_POPULATE).exec();
  }
}

export const taskRepository = new TaskRepository();
