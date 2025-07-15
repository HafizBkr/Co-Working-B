import mongoose from "mongoose";
import Workspace, { IWorkspace, WorkspaceRole } from "../models/Workspace";
import WorkspaceMember, { IWorkspaceMember } from "../models/WorkspaceMember";
import { BaseRepository } from "./base.repository";

class WorkspaceRepositoryClass extends BaseRepository<IWorkspace> {
  constructor() {
    super(Workspace);
  }

  /**
   * Create a new workspace with session support
   */
  async createWorkspace(
    workspaceData: Partial<IWorkspace>,
    session?: mongoose.ClientSession,
  ): Promise<IWorkspace> {
    const options = session ? { session } : {};
    return (await this.model.create([workspaceData], options))[0];
  }

  /**
   * Update workspace with validation
   */
  async updateWorkspace(
    workspaceId: string,
    updateData: Partial<IWorkspace>,
  ): Promise<IWorkspace | null> {
    return this.model
      .findByIdAndUpdate(workspaceId, updateData, {
        new: true,
        runValidators: true,
      })
      .exec();
  }

  /**
   * Delete workspace with session support
   */
  async deleteWorkspace(
    workspaceId: string,
    session?: mongoose.ClientSession,
  ): Promise<IWorkspace | null> {
    const options = session ? { session } : {};
    return this.model.findByIdAndDelete(workspaceId, options).exec();
  }

  /**
   * Get workspaces created by user
   */
  async getUserWorkspaces(userId: string): Promise<IWorkspace[]> {
    return this.find({ createdBy: userId });
  }

  /**
   * Count workspace members
   */
  async countMembers(workspaceId: string): Promise<number> {
    return WorkspaceMember.countDocuments({
      workspace: workspaceId,
      inviteAccepted: true,
    }).exec();
  }
}

export const WorkspaceRepository = new WorkspaceRepositoryClass();
export default WorkspaceRepository;
