import mongoose from "mongoose";
import { taskRepository } from "../repository/task.repository";
import { ITask } from "../models/Task";
import { sendTaskAssignmentEmail } from "../utils/taskAssignmentEmail";
import { PopulatedTask } from "../types/task.types";

export class TaskService {
  static async createTask(data: Partial<ITask>): Promise<ITask | null> {
    const task = (await taskRepository.create(data)) as {
      _id: string | mongoose.Types.ObjectId;
    };
    return taskRepository.findByIdPopulated(String(task._id));
  }

  static async getTaskById(id: string): Promise<ITask | null> {
    return taskRepository.findByIdPopulated(id);
  }

  static async getTasksByProject(projectId: string): Promise<ITask[]> {
    return taskRepository.findByProject(projectId);
  }

  static async getTasksByWorkspace(workspaceId: string): Promise<ITask[]> {
    return taskRepository.findByWorkspace(workspaceId);
  }

  static async getTasksByAssignedTo(userId: string): Promise<ITask[]> {
    return taskRepository.findByAssignedTo(userId);
  }

  static async getTasksByStatus(status: string): Promise<ITask[]> {
    return taskRepository.findByStatus(status);
  }

  static async updateTask(
    id: string,
    data: Partial<ITask>,
  ): Promise<ITask | null> {
    await taskRepository.updateById(id, data);
    return taskRepository.findByIdPopulated(id);
  }

  static async deleteTask(id: string): Promise<ITask | null> {
    return taskRepository.deleteById(id);
  }

  static async assignTask(
    taskId: string,
    userId: string,
  ): Promise<PopulatedTask | null> {
    await taskRepository.updateById(taskId, {
      assignedTo: new mongoose.Types.ObjectId(userId),
    });

    const task = (await taskRepository.findByIdPopulated(
      taskId,
    )) as PopulatedTask | null;

    if (task?.assignedTo?.email && task?.createdBy) {
      await sendTaskAssignmentEmail({
        to: task.assignedTo.email,
        task,
        assignedBy: {
          username: task.createdBy.username,
          email: task.createdBy.email,
        },
      });
    }

    return task;
  }

  static async changeTaskStatus(
    taskId: string,
    status: string,
  ): Promise<ITask | null> {
    await taskRepository.updateById(taskId, { status });
    return taskRepository.findByIdPopulated(taskId);
  }
}
