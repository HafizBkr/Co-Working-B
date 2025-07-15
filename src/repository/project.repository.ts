import mongoose from "mongoose";
import { BaseRepository, IBaseRepository } from "./base.repository";
import Project, { IProject } from "../models/Project";

export interface IProjectRepository extends IBaseRepository<IProject> {
  findByWorkspace(workspaceId: string): Promise<IProject[]>;
  findByCreatedBy(userId: string): Promise<IProject[]>;
  findByWorkspaceAndCreatedBy(
    workspaceId: string,
    userId: string,
  ): Promise<IProject[]>;
  findActiveProjects(): Promise<IProject[]>;
  findProjectsInDateRange(startDate: Date, endDate: Date): Promise<IProject[]>;
  updateProjectDates(
    id: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<IProject | null>;
  createProject(projectData: {
    name: string;
    description?: string;
    workspace: string;
    createdBy: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<IProject>;
  updateProject(
    id: string,
    updateData: Partial<IProject>,
  ): Promise<IProject | null>;
}

export class ProjectRepository
  extends BaseRepository<IProject>
  implements IProjectRepository
{
  constructor() {
    super(Project);
  }

  async findByWorkspace(workspaceId: string): Promise<IProject[]> {
    return this.model
      .find({ workspace: workspaceId })
      .populate("workspace", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByCreatedBy(userId: string): Promise<IProject[]> {
    return this.model
      .find({ createdBy: userId })
      .populate("workspace", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByWorkspaceAndCreatedBy(
    workspaceId: string,
    userId: string,
  ): Promise<IProject[]> {
    return this.model
      .find({
        workspace: workspaceId,
        createdBy: userId,
      })
      .populate("workspace", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .exec();
  }

  async findActiveProjects(): Promise<IProject[]> {
    const now = new Date();
    return this.model
      .find({
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: now } },
        ],
      })
      .populate("workspace", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .exec();
  }

  async findProjectsInDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<IProject[]> {
    return this.model
      .find({
        $or: [
          {
            startDate: { $gte: startDate, $lte: endDate },
          },
          {
            endDate: { $gte: startDate, $lte: endDate },
          },
          {
            startDate: { $lte: startDate },
            endDate: { $gte: endDate },
          },
        ],
      })
      .populate("workspace", "name")
      .populate("createdBy", "name email")
      .sort({ startDate: 1 })
      .exec();
  }

  async updateProjectDates(
    id: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<IProject | null> {
    const updateData: any = {};
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;

    return this.model
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate("workspace", "name")
      .populate("createdBy", "name email")
      .exec();
  }

  async create(data: Partial<IProject>): Promise<IProject> {
    const project = await this.model.create(data);
    return this.model
      .findById(project._id)
      .populate("workspace", "name")
      .populate("createdBy", "name email")
      .exec() as Promise<IProject>;
  }

  async createProject(projectData: {
    name: string;
    description?: string;
    workspace: string;
    createdBy: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<IProject> {
    if (projectData.startDate && projectData.endDate) {
      if (projectData.startDate > projectData.endDate) {
        throw new Error(
          "La date de début ne peut pas être postérieure à la date de fin",
        );
      }
    }

    if (!projectData.name || projectData.name.trim().length === 0) {
      throw new Error("Le nom du projet est obligatoire");
    }

    if (!mongoose.Types.ObjectId.isValid(projectData.workspace)) {
      throw new Error("ID workspace invalide");
    }
    if (!mongoose.Types.ObjectId.isValid(projectData.createdBy)) {
      throw new Error("ID utilisateur invalide");
    }

    return this.create({
      ...projectData,
      workspace: new mongoose.Types.ObjectId(projectData.workspace),
      createdBy: new mongoose.Types.ObjectId(projectData.createdBy),
    });
  }

  async updateProject(
    id: string,
    updateData: Partial<IProject>,
  ): Promise<IProject | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID projet invalide");
    }

    if (updateData.startDate && updateData.endDate) {
      if (updateData.startDate > updateData.endDate) {
        throw new Error(
          "La date de début ne peut pas être postérieure à la date de fin",
        );
      }
    }

    if (
      updateData.name !== undefined &&
      (!updateData.name || updateData.name.trim().length === 0)
    ) {
      throw new Error("Le nom du projet ne peut pas être vide");
    }

    if (
      updateData.workspace &&
      !mongoose.Types.ObjectId.isValid(updateData.workspace)
    ) {
      throw new Error("ID workspace invalide");
    }
    if (
      updateData.createdBy &&
      !mongoose.Types.ObjectId.isValid(updateData.createdBy)
    ) {
      throw new Error("ID utilisateur invalide");
    }

    const cleanUpdateData = { ...updateData };
    delete cleanUpdateData._id;
    delete cleanUpdateData.createdAt;
    delete cleanUpdateData.updatedAt;

    return this.model
      .findByIdAndUpdate(id, cleanUpdateData, { new: true })
      .populate("workspace", "name")
      .populate("createdBy", "name email")
      .exec();
  }

  async findById(id: string): Promise<IProject | null> {
    return this.model
      .findById(id)
      .populate("workspace", "name")
      .populate("createdBy", "name email")
      .exec();
  }

  async findOne(
    filter: mongoose.FilterQuery<IProject>,
  ): Promise<IProject | null> {
    return this.model
      .findOne(filter)
      .populate("workspace", "name")
      .populate("createdBy", "name email")
      .exec();
  }

  async find(filter: mongoose.FilterQuery<IProject>): Promise<IProject[]> {
    return this.model
      .find(filter)
      .populate("workspace", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateById(
    id: string,
    update: mongoose.UpdateQuery<IProject>,
  ): Promise<IProject | null> {
    return this.model
      .findByIdAndUpdate(id, update, { new: true })
      .populate("workspace", "name")
      .populate("createdBy", "name email")
      .exec();
  }

  async updateOne(
    filter: mongoose.FilterQuery<IProject>,
    update: mongoose.UpdateQuery<IProject>,
  ): Promise<IProject | null> {
    return this.model
      .findOneAndUpdate(filter, update, { new: true })
      .populate("workspace", "name")
      .populate("createdBy", "name email")
      .exec();
  }
}

export const projectRepository = new ProjectRepository();

export default projectRepository;
