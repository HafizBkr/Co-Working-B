import mongoose from "mongoose";
import { taskRepository } from "../repository/task.repository";
import { ITask } from "../models/Task";
import { sendTaskAssignmentEmail } from "../utils/taskAssignmentEmail";

export class TaskService {
  static async createTask(data: Partial<ITask>) {
    const task = await taskRepository.create(data);
    return taskRepository.findByIdPopulated(task._id);
  }

  static async getTaskById(id: string) {
    return taskRepository.findByIdPopulated(id);
  }

  static async getTasksByProject(projectId: string) {
    return taskRepository.findByProject(projectId);
  }

  static async getTasksByWorkspace(workspaceId: string) {
    return taskRepository.findByWorkspace(workspaceId);
  }

  static async getTasksByAssignedTo(userId: string) {
    return taskRepository.findByAssignedTo(userId);
  }

  static async getTasksByStatus(status: string) {
    return taskRepository.findByStatus(status);
  }

  static async updateTask(id: string, data: Partial<ITask>) {
    await taskRepository.updateById(id, data);
    return taskRepository.findByIdPopulated(id);
  }

  static async deleteTask(id: string) {
    return taskRepository.deleteById(id);
  }

  static async assignTask(taskId: string, userId: string) {
    await taskRepository.updateById(taskId, {
      assignedTo: new mongoose.Types.ObjectId(userId),
    });

    const task = await taskRepository.model
      .findById(taskId)
      .populate([
        { path: "assignedTo", select: "email username avatar" },
        { path: "createdBy", select: "email username avatar" },
        { path: "project", select: "name" },
        { path: "workspace", select: "name" },
      ])
      .lean();

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

  static async changeTaskStatus(taskId: string, status: string) {
    await taskRepository.updateById(taskId, { status });
    return taskRepository.findByIdPopulated(taskId);
  }
}
