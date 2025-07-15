import { Request, Response } from "express";
import { TaskService } from "../services/task.service";

export class TaskController {
  static async createTask(req: Request, res: Response) {
    try {
      const data = {
        ...req.body,
        project: req.params.projectId,
        createdBy: req.user?.userId,
      };
      const task = await TaskService.createTask(data);
      res.status(201).json({ success: true, data: task });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  static async getTaskById(req: Request, res: Response) {
    try {
      const task = await TaskService.getTaskById(req.params.taskId);
      if (!task)
        return res
          .status(404)
          .json({ success: false, message: "Task not found" });
      res.json({ success: true, data: task });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  static async getTasksByProject(req: Request, res: Response) {
    try {
      const tasks = await TaskService.getTasksByProject(req.params.projectId);
      res.json({ success: true, data: tasks });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  static async getTasksByWorkspace(req: Request, res: Response) {
    try {
      const tasks = await TaskService.getTasksByWorkspace(
        req.params.workspaceId,
      );
      res.json({ success: true, data: tasks });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  static async getTasksByAssignedTo(req: Request, res: Response) {
    try {
      const tasks = await TaskService.getTasksByAssignedTo(req.params.userId);
      res.json({ success: true, data: tasks });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  static async getTasksByStatus(req: Request, res: Response) {
    try {
      const tasks = await TaskService.getTasksByStatus(req.params.status);
      res.json({ success: true, data: tasks });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  static async updateTask(req: Request, res: Response) {
    try {
      const task = await TaskService.updateTask(req.params.taskId, req.body);
      if (!task)
        return res
          .status(404)
          .json({ success: false, message: "Task not found" });
      res.json({ success: true, data: task });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  static async deleteTask(req: Request, res: Response) {
    try {
      const task = await TaskService.deleteTask(req.params.taskId);
      if (!task)
        return res
          .status(404)
          .json({ success: false, message: "Task not found" });
      res.status(204).send();
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  static async assignTask(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      const task = await TaskService.assignTask(req.params.taskId, userId);
      if (!task)
        return res
          .status(404)
          .json({ success: false, message: "Task not found" });
      res.json({ success: true, data: task });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  static async changeTaskStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;
      const task = await TaskService.changeTaskStatus(
        req.params.taskId,
        status,
      );
      if (!task)
        return res
          .status(404)
          .json({ success: false, message: "Task not found" });
      res.json({ success: true, data: task });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }
}
