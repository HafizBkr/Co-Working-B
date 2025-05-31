import mongoose from "mongoose";
import { projectRepository } from "../repository/project.repository";
import { IProject } from "../models/Project";

export interface CreateProjectRequest {
  name: string;
  description?: string;
  workspace: string;
  createdBy: string;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ProjectFilter {
  workspace?: string;
  createdBy?: string;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
}

export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  overdue: number;
  planning: number;
}

export const ProjectService = {
  async createProject(data: CreateProjectRequest): Promise<IProject> {
    try {
      await this.validateProjectCreation(data);

      return await projectRepository.createProject(data);
    } catch (error) {
      throw new Error(`Erreur lors de la création du projet: ${error.message}`);
    }
  },

  async getProjectById(id: string): Promise<IProject | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("ID projet invalide");
      }

      return await projectRepository.findById(id);
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération du projet: ${error.message}`,
      );
    }
  },

  async getProjects(filters: ProjectFilter = {}): Promise<IProject[]> {
    try {
      let projects: IProject[];

      if (filters.workspace && filters.createdBy) {
        projects = await projectRepository.findByWorkspaceAndCreatedBy(
          filters.workspace,
          filters.createdBy,
        );
      } else if (filters.workspace) {
        projects = await projectRepository.findByWorkspace(filters.workspace);
      } else if (filters.createdBy) {
        projects = await projectRepository.findByCreatedBy(filters.createdBy);
      } else if (filters.isActive) {
        projects = await projectRepository.findActiveProjects();
      } else if (filters.startDate && filters.endDate) {
        projects = await projectRepository.findProjectsInDateRange(
          filters.startDate,
          filters.endDate,
        );
      } else {
        projects = await projectRepository.find({});
      }

      return projects;
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération des projets: ${error.message}`,
      );
    }
  },

  async updateProject(
    id: string,
    data: UpdateProjectRequest,
  ): Promise<IProject | null> {
    try {
      await this.validateProjectUpdate(id, data);

      return await projectRepository.updateProject(id, data);
    } catch (error) {
      throw new Error(
        `Erreur lors de la mise à jour du projet: ${error.message}`,
      );
    }
  },

  async deleteProject(id: string): Promise<boolean> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("ID projet invalide");
      }

      const existingProject = await projectRepository.findById(id);
      if (!existingProject) {
        throw new Error("Projet non trouvé");
      }

      await this.validateProjectDeletion(id);

      const deletedProject = await projectRepository.deleteById(id);
      return !!deletedProject;
    } catch (error) {
      throw new Error(
        `Erreur lors de la suppression du projet: ${error.message}`,
      );
    }
  },

  async getProjectStats(
    workspaceId?: string,
    userId?: string,
  ): Promise<ProjectStats> {
    try {
      let projects: IProject[];

      if (workspaceId && userId) {
        projects = await projectRepository.findByWorkspaceAndCreatedBy(
          workspaceId,
          userId,
        );
      } else if (workspaceId) {
        projects = await projectRepository.findByWorkspace(workspaceId);
      } else if (userId) {
        projects = await projectRepository.findByCreatedBy(userId);
      } else {
        projects = await projectRepository.find({});
      }

      const now = new Date();
      const stats: ProjectStats = {
        total: projects.length,
        active: 0,
        completed: 0,
        overdue: 0,
        planning: 0,
      };

      projects.forEach((project) => {
        const status = this.getProjectStatus(project, now);
        stats[status]++;
      });

      return stats;
    } catch (error) {
      throw new Error(
        `Erreur lors du calcul des statistiques: ${error.message}`,
      );
    }
  },

  async updateProjectDates(
    id: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<IProject | null> {
    try {
      if (startDate && endDate && startDate > endDate) {
        throw new Error(
          "La date de début ne peut pas être postérieure à la date de fin",
        );
      }

      return await projectRepository.updateProjectDates(id, startDate, endDate);
    } catch (error) {
      throw new Error(
        `Erreur lors de la mise à jour des dates: ${error.message}`,
      );
    }
  },

  async getOverdueProjects(workspaceId?: string): Promise<IProject[]> {
    try {
      const now = new Date();
      let projects: IProject[];

      if (workspaceId) {
        projects = await projectRepository.findByWorkspace(workspaceId);
      } else {
        projects = await projectRepository.find({});
      }

      return projects.filter(
        (project) => project.endDate && project.endDate < now,
      );
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération des projets en retard: ${error.message}`,
      );
    }
  },

  async getActiveProjects(workspaceId?: string): Promise<IProject[]> {
    try {
      if (workspaceId) {
        const allProjects =
          await projectRepository.findByWorkspace(workspaceId);
        return allProjects.filter((project) => this.isProjectActive(project));
      }

      return await projectRepository.findActiveProjects();
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération des projets actifs: ${error.message}`,
      );
    }
  },

  async getCompletedProjects(workspaceId?: string): Promise<IProject[]> {
    try {
      const now = new Date();
      let projects: IProject[];

      if (workspaceId) {
        projects = await projectRepository.findByWorkspace(workspaceId);
      } else {
        projects = await projectRepository.find({});
      }

      return projects.filter(
        (project) =>
          project.endDate &&
          project.endDate < now &&
          project.startDate &&
          project.startDate <= now,
      );
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération des projets terminés: ${error.message}`,
      );
    }
  },

  async duplicateProject(
    id: string,
    newName: string,
    createdBy: string,
  ): Promise<IProject> {
    try {
      const originalProject = await projectRepository.findById(id);
      if (!originalProject) {
        throw new Error("Projet original non trouvé");
      }

      const workspaceId =
        typeof originalProject.workspace === "object" &&
        originalProject.workspace._id
          ? originalProject.workspace._id.toString()
          : originalProject.workspace.toString();

      const duplicateData: CreateProjectRequest = {
        name: newName,
        description: originalProject.description
          ? `Copie de: ${originalProject.description}`
          : undefined,
        workspace: workspaceId,
        createdBy: createdBy,
        startDate: undefined,
        endDate: undefined,
      };

      return await this.createProject(duplicateData);
    } catch (error) {
      throw new Error(
        `Erreur lors de la duplication du projet: ${error.message}`,
      );
    }
  },

  async archiveProject(id: string): Promise<IProject | null> {
    try {
      return await projectRepository.updateById(id, {
        archived: true,
      } as any);
    } catch (error) {
      throw new Error(`Erreur lors de l'archivage du projet: ${error.message}`);
    }
  },

  getProjectStatus(
    project: IProject,
    now: Date = new Date(),
  ): "planning" | "active" | "completed" | "overdue" {
    if (!project.startDate) return "planning";

    if (project.startDate > now) return "planning";

    if (project.endDate) {
      if (project.endDate < now) return "overdue";
      return "active";
    }

    return "active";
  },

  calculateProjectDuration(project: IProject): number | null {
    if (!project.startDate || !project.endDate) return null;

    const diffTime = Math.abs(
      project.endDate.getTime() - project.startDate.getTime(),
    );
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  isProjectActive(project: IProject): boolean {
    const now = new Date();

    if (!project.startDate) return false;
    if (project.startDate > now) return false;
    if (project.endDate && project.endDate < now) return false;

    return true;
  },

  isProjectOverdue(project: IProject): boolean {
    const now = new Date();
    return !!(project.endDate && project.endDate < now);
  },

  async getProjectsByPeriod(
    startDate: Date,
    endDate: Date,
    workspaceId?: string,
  ): Promise<IProject[]> {
    try {
      if (workspaceId) {
        const allProjects =
          await projectRepository.findByWorkspace(workspaceId);
        return allProjects.filter((project) =>
          this.isProjectInPeriod(project, startDate, endDate),
        );
      }

      return await projectRepository.findProjectsInDateRange(
        startDate,
        endDate,
      );
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération des projets par période: ${error.message}`,
      );
    }
  },

  async validateProjectCreation(data: CreateProjectRequest): Promise<void> {
    const existingProject = await projectRepository.findOne({
      name: data.name,
      workspace: data.workspace,
    });

    if (existingProject) {
      throw new Error("Un projet avec ce nom existe déjà dans ce workspace");
    }

    if (data.name.length < 3) {
      throw new Error("Le nom du projet doit contenir au moins 3 caractères");
    }

    if (data.name.length > 100) {
      throw new Error("Le nom du projet ne peut pas dépasser 100 caractères");
    }

    if (data.description && data.description.length > 500) {
      throw new Error("La description ne peut pas dépasser 500 caractères");
    }
  },

  async validateProjectUpdate(
    id: string,
    data: UpdateProjectRequest,
  ): Promise<void> {
    const existingProject = await projectRepository.findById(id);
    if (!existingProject) {
      throw new Error("Projet non trouvé");
    }

    if (data.name && data.name !== existingProject.name) {
      const projectWithSameName = await projectRepository.findOne({
        name: data.name,
        workspace: existingProject.workspace,
        _id: { $ne: id },
      });

      if (projectWithSameName) {
        throw new Error("Un projet avec ce nom existe déjà dans ce workspace");
      }
    }

    if (data.name && data.name.length < 3) {
      throw new Error("Le nom du projet doit contenir au moins 3 caractères");
    }

    if (data.name && data.name.length > 100) {
      throw new Error("Le nom du projet ne peut pas dépasser 100 caractères");
    }

    if (data.description && data.description.length > 500) {
      throw new Error("La description ne peut pas dépasser 500 caractères");
    }
  },

  async validateProjectDeletion(id: string): Promise<void> {
    const existingProject = await projectRepository.findById(id);
    if (!existingProject) {
      throw new Error("Projet non trouvé");
    }
  },

  isProjectInPeriod(
    project: IProject,
    startDate: Date,
    endDate: Date,
  ): boolean {
    if (!project.startDate) return false;

    return (
      (project.startDate >= startDate && project.startDate <= endDate) ||
      (project.endDate &&
        project.endDate >= startDate &&
        project.endDate <= endDate) ||
      (project.startDate <= startDate &&
        project.endDate &&
        project.endDate >= endDate)
    );
  },
};

export default ProjectService;
