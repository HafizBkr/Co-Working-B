import { Request, Response } from "express";
import { TaskService } from "../services/task.service";
import {
  RESPONSE_CODES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "../utils/error_response";

export class TaskController {
  static async createTask(req: Request, res: Response) {
    try {
      const projectId = req.params.projectId;
      const taskData = {
        ...req.body,
        project: projectId,
        createdBy: req.user?.userId,
      };
      const task = await TaskService.createTask(taskData);
      res.status(RESPONSE_CODES.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.TASK_CREATED,
        data: task,
      });
    } catch (e: any) {
      res.status(RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: e.message || ERROR_MESSAGES.TASK_CREATION_FAILED,
      });
    }
  }

  static async getTaskById(req: Request, res: Response) {
    try {
      const task = await TaskService.getTaskById(req.params.taskId);
      if (!task)
        return res
          .status(RESPONSE_CODES.NOT_FOUND)
          .json({ success: false, message: ERROR_MESSAGES.TASK_NOT_FOUND });
      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.TASK_FOUND,
        data: task,
      });
    } catch (e: any) {
      res.status(RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: e.message || ERROR_MESSAGES.TASK_NOT_FOUND,
      });
    }
  }

  static async getTasksByProject(req: Request, res: Response) {
    try {
      const tasks = await TaskService.getTasksByProject(req.params.projectId);
      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.TASKS_FOUND,
        data: tasks,
      });
    } catch (e: any) {
      res.status(RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: e.message || ERROR_MESSAGES.TASK_NOT_FOUND,
      });
    }
  }

  static async getTasksByWorkspace(req: Request, res: Response) {
    try {
      const tasks = await TaskService.getTasksByWorkspace(
        req.params.workspaceId,
      );
      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.TASKS_FOUND,
        data: tasks,
      });
    } catch (e: any) {
      res.status(RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: e.message || ERROR_MESSAGES.TASK_NOT_FOUND,
      });
    }
  }

  static async getTasksByAssignedTo(req: Request, res: Response) {
    try {
      const tasks = await TaskService.getTasksByAssignedTo(req.params.userId);
      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.TASKS_FOUND,
        data: tasks,
      });
    } catch (e: any) {
      res.status(RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: e.message || ERROR_MESSAGES.TASK_NOT_FOUND,
      });
    }
  }

  static async getTasksByStatus(req: Request, res: Response) {
    try {
      const tasks = await TaskService.getTasksByStatus(req.params.status);
      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.TASKS_FOUND,
        data: tasks,
      });
    } catch (e: any) {
      res.status(RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: e.message || ERROR_MESSAGES.TASK_NOT_FOUND,
      });
    }
  }

  static async updateTask(req: Request, res: Response) {
    try {
      const task = await TaskService.updateTask(req.params.taskId, req.body);
      if (!task)
        return res
          .status(RESPONSE_CODES.NOT_FOUND)
          .json({ success: false, message: ERROR_MESSAGES.TASK_NOT_FOUND });
      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.TASK_UPDATED,
        data: task,
      });
    } catch (e: any) {
      res.status(RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: e.message || ERROR_MESSAGES.TASK_UPDATE_FAILED,
      });
    }
  }

  static async deleteTask(req: Request, res: Response) {
    try {
      const task = await TaskService.deleteTask(req.params.taskId);
      if (!task)
        return res
          .status(RESPONSE_CODES.NOT_FOUND)
          .json({ success: false, message: ERROR_MESSAGES.TASK_NOT_FOUND });
      res.status(RESPONSE_CODES.NO_CONTENT).json({
        success: true,
        message: SUCCESS_MESSAGES.TASK_DELETED,
      });
    } catch (e: any) {
      res.status(RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: e.message || ERROR_MESSAGES.TASK_DELETE_FAILED,
      });
    }
  }

  static async assignTask(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      const workspaceId = req.params.workspaceId;
      const task = await TaskService.getTaskById(req.params.taskId);

      if (!task)
        return res
          .status(RESPONSE_CODES.NOT_FOUND)
          .json({ success: false, message: ERROR_MESSAGES.TASK_NOT_FOUND });

      if (workspaceId && task.workspace.toString() !== workspaceId) {
        return res.status(RESPONSE_CODES.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.TASK_WORKSPACE_MISMATCH,
        });
      }

      const updatedTask = await TaskService.assignTask(
        req.params.taskId,
        userId,
      );
      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.TASK_ASSIGNED,
        data: updatedTask,
      });
    } catch (e: any) {
      res.status(RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: e.message || ERROR_MESSAGES.TASK_ASSIGN_FAILED,
      });
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
          .status(RESPONSE_CODES.NOT_FOUND)
          .json({ success: false, message: ERROR_MESSAGES.TASK_NOT_FOUND });
      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.TASK_STATUS_CHANGED,
        data: task,
      });
    } catch (e: any) {
      res.status(RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: e.message || ERROR_MESSAGES.TASK_STATUS_CHANGE_FAILED,
      });
    }
  }
}
