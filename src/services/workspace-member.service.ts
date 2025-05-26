import WorkspaceMemberRepository from "../repository/workspace-member.repository";
import WorkspaceInvitation from "../models/WorkspaceInvitation";
import { WorkspaceRole } from "../models/Workspace";

export const WorkspaceMemberService = {
  /**
   * Get all members of a workspace
   */
  getWorkspaceMembers: async (workspaceId: string) => {
    return WorkspaceMemberRepository.getWorkspaceMembers(workspaceId);
  },

  /**
   * Update a member's role
   */
  updateMemberRole: async (
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
  ) => {
    const membership = await WorkspaceMemberRepository.findMembership(
      workspaceId,
      userId,
    );
    if (!membership) {
      throw new Error("Membership not found");
    }
    membership.role = role;
    membership.lastActive = new Date();
    return membership.save();
  },

  /**
   * Remove a member from workspace by membership ID
   * Also removes the associated invitation to prevent duplicate key errors
   */
  removeMemberById: async (memberId: string) => {
    const memberWithUser = await WorkspaceMemberRepository.model
      .findById(memberId)
      .populate("user", "email")
      .exec();

    if (!memberWithUser) {
      throw new Error("Membership not found");
    }

    const userEmail = memberWithUser.user?.email;

    await WorkspaceMemberRepository.deleteById(memberId);
    if (userEmail && memberWithUser.workspace) {
      try {
        await WorkspaceInvitation.deleteOne({
          workspace: memberWithUser.workspace,
          email: userEmail.toLowerCase().trim(),
        });
      } catch (error) {
        console.warn("Could not delete associated invitation:", error);
      }
    }

    return memberWithUser;
  },

  /**
   * Remove a member from workspace (legacy method - by userId)
   * Also removes the associated invitation to prevent duplicate key errors
   */
  removeMember: async (workspaceId: string, userId: string) => {
    // Récupérer le membre avec les données utilisateur
    const memberWithUser = await WorkspaceMemberRepository.model
      .findOne({
        workspace: workspaceId,
        user: userId,
      })
      .populate("user", "email")
      .exec();

    if (!memberWithUser) {
      throw new Error("Membership not found");
    }

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

  /**
   * Update user position in workspace
   */
  updateUserPosition: async (
    workspaceId: string,
    userId: string,
    position: { x: number; y: number },
  ) => {
    const membership = await WorkspaceMemberRepository.findMembership(
      workspaceId,
      userId,
    );
    if (!membership) {
      throw new Error("User is not a member of this workspace");
    }
    membership.currentPosition = position;
    membership.lastActive = new Date();
    return membership.save();
  },
};

export default WorkspaceMemberService;
