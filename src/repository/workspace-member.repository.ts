import mongoose from "mongoose";
import WorkspaceMember, { IWorkspaceMember } from "../models/WorkspaceMember";
import { WorkspaceRole } from "../models/Workspace";
import { BaseRepository } from "./base.repository";
import { IUser } from "../models/user";

class WorkspaceMemberRepositoryClass extends BaseRepository<IWorkspaceMember> {
  constructor() {
    super(WorkspaceMember);
  }

  async findMembershipByEmail(
    workspaceId: string,
    email: string,
  ): Promise<IWorkspaceMember | null> {
    return this.findOne({
      workspace: workspaceId,
      email: email.toLowerCase().trim(),
    });
  }

  async createMembership(
    memberData: Partial<IWorkspaceMember>,
    session?: mongoose.ClientSession,
  ): Promise<IWorkspaceMember> {
    const options = session ? { session } : {};
    return (await this.model.create([memberData], options))[0];
  }

  async findUserMemberships(userId: string): Promise<IWorkspaceMember[]> {
    return this.model
      .find({ user: userId, inviteAccepted: true })
      .populate("workspace")
      .exec();
  }

  async findMembership(
    workspaceId: string,
    userId: string,
  ): Promise<IWorkspaceMember | null> {
    return this.findOne({ workspace: workspaceId, user: userId });
  }

  async deleteOneMembership(workspaceId: string, userId: string) {
    return WorkspaceMember.deleteOne({ workspace: workspaceId, user: userId });
  }

  async getWorkspaceMembers(workspaceId: string): Promise<IWorkspaceMember[]> {
    return this.model
      .find({ workspace: workspaceId })
      .populate("user", "username email avatar")
      .exec();
  }

  async updateMemberRole(
    memberId: string,
    role: WorkspaceRole,
  ): Promise<IWorkspaceMember | null> {
    return this.model
      .findByIdAndUpdate(memberId, { role }, { new: true })
      .populate("user", "name email profilePicture")
      .exec();
  }

  async getActiveWorkspaceUsers(workspaceId: string, activeThreshold: Date) {
    return this.model
      .find({ workspace: workspaceId, lastActive: { $gte: activeThreshold } })
      .populate<{ user: IUser }>("user", "name email profilePicture username")
      .exec();
  }

  async findByIdWithUser(memberId: string): Promise<IWorkspaceMember | null> {
    return this.model.findById(memberId).populate("user", "email").exec();
  }

  async findOneWithUser(
    workspaceId: string,
    userId: string,
  ): Promise<IWorkspaceMember | null> {
    return this.model
      .findOne({ workspace: workspaceId, user: userId })
      .populate("user", "email")
      .exec();
  }
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

  async updateUserPosition(
    workspaceId: string,
    userId: string,
    position: { x: number; y: number },
  ): Promise<IWorkspaceMember | null> {
    return this.model
      .findOneAndUpdate(
        { workspace: workspaceId, user: userId },
        { currentPosition: position, lastActive: new Date() },
        { new: true },
      )
      .exec();
  }

  async deleteByIdWithUser(memberId: string): Promise<IWorkspaceMember | null> {
    // Optionnel : pour supprimer et retourner le membre peuplé
    return this.model
      .findByIdAndDelete(memberId)
      .populate("user", "email")
      .exec();
  }
}

export const WorkspaceMemberRepository = new WorkspaceMemberRepositoryClass();
export default WorkspaceMemberRepository;
