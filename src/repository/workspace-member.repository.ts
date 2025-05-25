import mongoose from "mongoose";
import WorkspaceMember, { IWorkspaceMember } from "../models/WorkspaceMember";
import { WorkspaceRole } from "../models/Workspace";
import { BaseRepository } from "./baseRepository";

class WorkspaceMemberRepositoryClass extends BaseRepository<IWorkspaceMember> {
  constructor() {
    super(WorkspaceMember);
  }

  /**
   * Find membership by email
   */
  async findMembershipByEmail(
    workspaceId: string,
    email: string,
  ): Promise<IWorkspaceMember | null> {
    return this.findOne({
      workspace: workspaceId,
      email: email.toLowerCase().trim(),
    });
  }

  /**
   * Create workspace membership with session support
   */
  async createMembership(
    memberData: Partial<IWorkspaceMember>,
    session?: mongoose.ClientSession,
  ): Promise<IWorkspaceMember> {
    const options = session ? { session } : {};
    return (await this.model.create([memberData], options))[0];
  }

  /**
   * Find user memberships with populated workspace data
   */
  async findUserMemberships(userId: string): Promise<IWorkspaceMember[]> {
    return this.model
      .find({
        user: userId,
        inviteAccepted: true,
      })
      .populate("workspace")
      .exec();
  }

  /**
   * Find a specific membership
   */
  async findMembership(
    workspaceId: string,
    userId: string,
  ): Promise<IWorkspaceMember | null> {
    return this.findOne({
      workspace: workspaceId,
      user: userId,
    });
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
