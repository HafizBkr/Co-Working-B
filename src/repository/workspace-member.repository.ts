import mongoose from "mongoose";
import WorkspaceMember, { IWorkspaceMember } from "../models/WorkspaceMember";
import { WorkspaceRole } from "../models/Workspace";
import { BaseRepository } from "./baseRepository";

class WorkspaceMemberRepositoryClass extends BaseRepository<IWorkspaceMember> {
  constructor() {
    super(WorkspaceMember);
  }

  /**
   * Get all members for a workspace with populated user data
   */
  async getWorkspaceMembers(workspaceId: string): Promise<IWorkspaceMember[]> {
    return this.model
      .find({
        workspace: workspaceId,
      })
      .populate("user", "name email profilePicture")
      .exec();
  }

  /**
   * Update member role with populated user data
   */
  async updateMemberRole(
    memberId: string,
    role: WorkspaceRole,
  ): Promise<IWorkspaceMember | null> {
    return this.model
      .findByIdAndUpdate(memberId, { role }, { new: true })
      .populate("user", "name email profilePicture")
      .exec();
  }

  /**
   * Delete all memberships for a workspace with session support
   */
  async deleteWorkspaceMemberships(
    workspaceId: string,
    session?: mongoose.ClientSession,
  ): Promise<number> {
    const options = session ? { session } : {};
    const result = await this.model
      .deleteMany({ workspace: workspaceId }, options)
      .exec();
    return result.deletedCount;
  }
}

export const WorkspaceMemberRepository = new WorkspaceMemberRepositoryClass();
export default WorkspaceMemberRepository;
