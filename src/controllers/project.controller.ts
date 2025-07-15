import { Request, Response } from "express";
import { ProjectService } from "../services/project.service";

export class ProjectController {
  static async createProject(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, startDate, endDate } = req.body;
      const { workspaceId } = req.params;
      const createdBy = req.user?.userId;

      if (!createdBy) {
        res
          .status(401)
          .json({ success: false, message: "Utilisateur non authentifié" });
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
      res.status(201).json({ success: true, data: result });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
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
      res.json({ success: true, data: result });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  static async getProjectById(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;

      const result = await ProjectService.getProjectById(projectId);
      if (!result) {
        res.status(404).json({ success: false, message: "Projet non trouvé" });
        return;
      }

      res.json({ success: true, data: result });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
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
        res.status(404).json({ success: false, message: "Projet non trouvé" });
        return;
      }

      res.json({ success: true, data: result });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  static async deleteProject(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;

      const result = await ProjectService.deleteProject(projectId);
      if (!result) {
        res.status(404).json({ success: false, message: "Projet non trouvé" });
        return;
      }

      res.json({ success: true, message: "Projet supprimé avec succès" });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  static async getProjectStats(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params;
      const userId = req.user?.userId;

      const result = await ProjectService.getProjectStats(workspaceId, userId);
      res.json({ success: true, data: result });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  static async getActiveProjects(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params;

      const result = await ProjectService.getActiveProjects(workspaceId);
      res.json({ success: true, data: result });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  static async getOverdueProjects(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params;

      const result = await ProjectService.getOverdueProjects(workspaceId);
      res.json({ success: true, data: result });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  static async getCompletedProjects(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { workspaceId } = req.params;

      const result = await ProjectService.getCompletedProjects(workspaceId);
      res.json({ success: true, data: result });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  static async duplicateProject(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { newName } = req.body;
      const createdBy = req.user?.userId;

      if (!createdBy) {
        res.status(401).json({
          success: false,
          message: "Utilisateur non authentifié",
        });
        return;
      }

      if (!newName) {
        res.status(400).json({
          success: false,
          message: "Le nouveau nom est requis pour la duplication",
        });
        return;
      }

      const result = await ProjectService.duplicateProject(
        projectId,
        newName,
        createdBy,
      );
      res.status(201).json({ success: true, data: result });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  static async archiveProject(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;

      const result = await ProjectService.archiveProject(projectId);
      if (!result) {
        res.status(404).json({ success: false, message: "Projet non trouvé" });
        return;
      }

      res.json({ success: true, message: "Projet archivé avec succès" });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
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
        res.status(404).json({ success: false, message: "Projet non trouvé" });
        return;
      }

      res.json({ success: true, data: result });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  static async getProjectsByPeriod(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: "Les dates de début et de fin sont requises",
        });
        return;
      }

      const result = await ProjectService.getProjectsByPeriod(
        new Date(startDate as string),
        new Date(endDate as string),
        workspaceId,
      );

      res.json({ success: true, data: result });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  static async getProjectStatus(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;

      const project = await ProjectService.getProjectById(projectId);
      if (!project) {
        res.status(404).json({ success: false, message: "Projet non trouvé" });
        return;
      }

      const status = ProjectService.getProjectStatus(project);
      const duration = ProjectService.calculateProjectDuration(project);
      const isActive = ProjectService.isProjectActive(project);
      const isOverdue = ProjectService.isProjectOverdue(project);

      res.json({
        success: true,
        data: {
          status,
          duration,
          isActive,
          isOverdue,
        },
      });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }
}
