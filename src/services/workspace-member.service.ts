import mongoose from "mongoose";
import WorkspaceMemberRepository from "../repository/workspace-member.repository";
import { UserRepository } from "../repository/UserRepository";
import { WorkspaceRole } from "../models/Workspace";
import { EmailService } from "./email.service";
import { removeMember } from "../controllers/workspace-member.controller";

const userRepository = new UserRepository();

export const WorkspaceMemberService = {
  /**
   * Get all members of a workspace
   */
  getWorkspaceMembers: async (workspaceId: string) => {
    return WorkspaceMemberRepository.getWorkspaceMembers(workspaceId);
  },

  /**
   * Update a me  mber's role
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
   * Remove a member from workspace
   */
  removeMember: async (workspaceId: string, userId: string) => {
    const membership = await WorkspaceMemberRepository.findMembership(
      workspaceId,
      userId,
    );

    if (!membership) {
      throw new Error("Membership not found");
    }

    await WorkspaceMemberRepository.deleteWorkspaceMemberships(workspaceId);

    return membership;
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

  /**
   * Get all active users in a workspace with their positions
   */
};

export default WorkspaceMemberService;
