import { Request, Response } from "express";
import { ProjectService } from "../services/project.service";
import {
  RESPONSE_CODES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "../utils/error_response";

export class ProjectController {
  static async createProject(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, startDate, endDate } = req.body;
      const { workspaceId } = req.params;
      const createdBy = req.user?.userId;

      if (!createdBy) {
        res
          .status(RESPONSE_CODES.UNAUTHORIZED)
          .json({ success: false, message: ERROR_MESSAGES.UNAUTHORIZED });
        return;
      }

      const projectData = {
        name,
        description,
        workspace: workspaceId,
        createdBy,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      };

      const result = await ProjectService.createProject(projectData);
      res.status(RESPONSE_CODES.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.PROJECT_CREATED,
        data: result,
      });
    } catch (e: any) {
      res.status(RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: e.message || ERROR_MESSAGES.PROJECT_CREATION_FAILED,
      });
    }
  }

  static async getProjectsByWorkspace(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { workspaceId } = req.params;
      const { createdBy, isActive, startDate, endDate } = req.query;

      const filters = {
        workspace: workspaceId,
        createdBy: createdBy as string,
        isActive: isActive === "true",
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      };

      const result = await ProjectService.getProjects(filters);
      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PROJECTS_FOUND,
        data: result,
      });
    } catch (e: any) {
      res.status(RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: e.message || ERROR_MESSAGES.PROJECTS_FETCH_FAILED,
      });
    }
  }

  static async getProjectById(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;

      const result = await ProjectService.getProjectById(projectId);
      if (!result) {
        res.status(RESPONSE_CODES.NOT_FOUND).json({
          success: false,
          message: ERROR_MESSAGES.PROJECT_NOT_FOUND,
        });
        return;
      }

      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PROJECT_FOUND,
        data: result,
      });
    } catch (e: any) {
      res.status(RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: e.message || ERROR_MESSAGES.PROJECTS_FETCH_FAILED,
      });
    }
  }

  static async updateProject(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { name, description, startDate, endDate } = req.body;

      const updateData = {
        name,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      };

      const result = await ProjectService.updateProject(projectId, updateData);
      if (!result) {
        res.status(RESPONSE_CODES.NOT_FOUND).json({
          success: false,
          message: ERROR_MESSAGES.PROJECT_NOT_FOUND,
        });
        return;
      }

      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PROJECT_UPDATED,
        data: result,
      });
    } catch (e: any) {
      res.status(RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: e.message || ERROR_MESSAGES.PROJECT_UPDATE_FAILED,
      });
    }
  }

  static async deleteProject(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;

      const result = await ProjectService.deleteProject(projectId);
      if (!result) {
        res.status(RESPONSE_CODES.NOT_FOUND).json({
          success: false,
          message: ERROR_MESSAGES.PROJECT_NOT_FOUND,
        });
        return;
      }

      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PROJECT_DELETED,
      });
    } catch (e: any) {
      res.status(RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: e.message || ERROR_MESSAGES.PROJECT_DELETE_FAILED,
      });
    }
  }

  static async getProjectStats(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params;
      const userId = req.user?.userId;

      const result = await ProjectService.getProjectStats(workspaceId, userId);
      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PROJECT_STATS_FOUND,
        data: result,
      });
    } catch (e: any) {
      res.status(RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: e.message || ERROR_MESSAGES.PROJECT_STATS_FAILED,
      });
    }
  }

  static async getActiveProjects(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params;

      const result = await ProjectService.getActiveProjects(workspaceId);
      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PROJECTS_ACTIVE_FOUND,
        data: result,
      });
    } catch (e: any) {
      res.status(RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: e.message || ERROR_MESSAGES.PROJECTS_ACTIVE_FETCH_FAILED,
      });
    }
  }

  static async getOverdueProjects(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params;

      const result = await ProjectService.getOverdueProjects(workspaceId);
      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PROJECTS_OVERDUE_FOUND,
        data: result,
      });
    } catch (e: any) {
      res.status(RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: e.message || ERROR_MESSAGES.PROJECTS_OVERDUE_FETCH_FAILED,
      });
    }
  }

  static async getCompletedProjects(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { workspaceId } = req.params;

      const result = await ProjectService.getCompletedProjects(workspaceId);
      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PROJECTS_COMPLETED_FOUND,
        data: result,
      });
    } catch (e: any) {
      res.status(RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: e.message || ERROR_MESSAGES.PROJECTS_COMPLETED_FETCH_FAILED,
      });
    }
  }

  static async duplicateProject(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { newName } = req.body;
      const createdBy = req.user?.userId;

      if (!createdBy) {
        res.status(RESPONSE_CODES.UNAUTHORIZED).json({
          success: false,
          message: ERROR_MESSAGES.UNAUTHORIZED,
        });
        return;
      }

      if (!newName) {
        res.status(RESPONSE_CODES.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.PROJECT_DUPLICATE_NAME_REQUIRED,
        });
        return;
      }

      const result = await ProjectService.duplicateProject(
        projectId,
        newName,
        createdBy,
      );
      res.status(RESPONSE_CODES.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.PROJECT_DUPLICATED,
        data: result,
      });
    } catch (e: any) {
      res.status(RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: e.message || ERROR_MESSAGES.PROJECT_DUPLICATE_FAILED,
      });
    }
  }

  static async archiveProject(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;

      const result = await ProjectService.archiveProject(projectId);
      if (!result) {
        res.status(RESPONSE_CODES.NOT_FOUND).json({
          success: false,
          message: ERROR_MESSAGES.PROJECT_NOT_FOUND,
        });
        return;
      }

      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PROJECT_ARCHIVED,
      });
    } catch (e: any) {
      res.status(RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: e.message || ERROR_MESSAGES.PROJECT_ARCHIVE_FAILED,
      });
    }
  }

  static async updateProjectDates(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { startDate, endDate } = req.body;

      const result = await ProjectService.updateProjectDates(
        projectId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
      );

      if (!result) {
        res.status(RESPONSE_CODES.NOT_FOUND).json({
          success: false,
          message: ERROR_MESSAGES.PROJECT_NOT_FOUND,
        });
        return;
      }

      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PROJECT_DATES_UPDATED,
        data: result,
      });
    } catch (e: any) {
      res.status(RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: e.message || ERROR_MESSAGES.PROJECT_UPDATE_DATES_FAILED,
      });
    }
  }

  static async getProjectsByPeriod(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(RESPONSE_CODES.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.PROJECT_DATES_REQUIRED,
        });
        return;
      }

      const result = await ProjectService.getProjectsByPeriod(
        new Date(startDate as string),
        new Date(endDate as string),
        workspaceId,
      );

      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PROJECTS_PERIOD_FOUND,
        data: result,
      });
    } catch (e: any) {
      res.status(RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: e.message || ERROR_MESSAGES.PROJECTS_FETCH_FAILED,
      });
    }
  }

  static async getProjectStatus(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;

      const project = await ProjectService.getProjectById(projectId);
      if (!project) {
        res.status(RESPONSE_CODES.NOT_FOUND).json({
          success: false,
          message: ERROR_MESSAGES.PROJECT_NOT_FOUND,
        });
        return;
      }

      const status = ProjectService.getProjectStatus(project);
      const duration = ProjectService.calculateProjectDuration(project);
      const isActive = ProjectService.isProjectActive(project);
      const isOverdue = ProjectService.isProjectOverdue(project);

      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PROJECT_STATUS_FOUND,
        data: {
          status,
          duration,
          isActive,
          isOverdue,
        },
      });
    } catch (e: any) {
      res.status(RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: e.message || ERROR_MESSAGES.PROJECT_STATUS_FAILED,
      });
    }
  }
}
