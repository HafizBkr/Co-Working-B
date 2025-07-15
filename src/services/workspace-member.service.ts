import WorkspaceMemberRepository from "../repository/workspace-member.repository";
import WorkspaceInvitation from "../models/WorkspaceInvitation";
import { WorkspaceRole } from "../models/Workspace";
import { IUser } from "../models/user";
import { PopulatedWorkspaceMember } from "../types/populated-workspace-member";

export const WorkspaceMemberService = {
  getWorkspaceMembers: async (workspaceId: string) => {
    return WorkspaceMemberRepository.getWorkspaceMembers(workspaceId);
  },

  updateMemberRole: async (
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
  ) => {
    const membership = await WorkspaceMemberRepository.findMembership(
      workspaceId,
      userId,
    );
    if (!membership) throw new Error("Membership not found");
    membership.role = role;
    membership.lastActive = new Date();
    return membership.save();
  },

  removeMemberById: async (memberId: string) => {
    const memberWithUser = (await WorkspaceMemberRepository.findByIdWithUser(
      memberId,
    )) as PopulatedWorkspaceMember | null;
    if (!memberWithUser) throw new Error("Membership not found");
    const userEmail = memberWithUser.user?.email;
    await WorkspaceMemberRepository.deleteById(memberId);
    if (userEmail && memberWithUser.workspace) {
      const workspaceId =
        typeof memberWithUser.workspace === "object" &&
        "_id" in memberWithUser.workspace
          ? (memberWithUser.workspace as any)._id
          : memberWithUser.workspace;
      try {
        await WorkspaceInvitation.deleteOne({
          workspace: workspaceId,
          email: userEmail.toLowerCase().trim(),
        });
      } catch (error) {
        console.warn("Could not delete associated invitation:", error);
      }
    }
    return memberWithUser;
  },

  removeMember: async (workspaceId: string, userId: string) => {
    const memberWithUser = (await WorkspaceMemberRepository.findOneWithUser(
      workspaceId,
      userId,
    )) as PopulatedWorkspaceMember | null;
    if (!memberWithUser) throw new Error("Membership not found");
    const userEmail = memberWithUser.user?.email;
    await WorkspaceMemberRepository.deleteOneMembership(workspaceId, userId);
    if (userEmail) {
      try {
        await WorkspaceInvitation.deleteOne({
          workspace: workspaceId,
          email: userEmail.toLowerCase().trim(),
        });
      } catch (error) {
        console.warn("Could not delete associated invitation:", error);
      }
    }
    return memberWithUser;
  },

  userHasAccessToWorkspace: async (
    workspaceId: string,
    userId: string,
  ): Promise<boolean> => {
    const membership = await WorkspaceMemberRepository.findMembership(
      workspaceId,
      userId,
    );
    return !!membership;
  },

  getActiveWorkspaceUsers: async (workspaceId: string) => {
    const activeThreshold = new Date(Date.now() - 10 * 60 * 1000);
    return WorkspaceMemberRepository.getActiveWorkspaceUsers(
      workspaceId,
      activeThreshold,
    );
  },

  updateUserPosition: async (
    workspaceId: string,
    userId: string,
    position: { x: number; y: number },
  ) => {
    const membership = await WorkspaceMemberRepository.findMembership(
      workspaceId,
      userId,
    );
    if (!membership) throw new Error("User is not a member of this workspace");
    membership.currentPosition = position;
    membership.lastActive = new Date();
    return membership.save();
  },
};

export default WorkspaceMemberService;
