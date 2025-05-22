import mongoose from "mongoose";
import WorkspaceMemberRepository from "../repository/workspace-member.repository";
import { UserRepository } from "../repository/UserRepository";
import { WorkspaceRole } from "../models/Workspace";
import { EmailService } from "./email.service";
import { removeMember } from "../controllers/workspace-member.controller";

const userRepository = new UserRepository();

export const WorkspaceMemberService = {
  /**
   * Invite a user to workspace (user can be absent from DB)
   */
  inviteUserToWorkspace: async (
    workspaceId: string,
    email: string,
    role: string,
    inviterId: string,
    workspaceName: string,
  ) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Vérifier si l'email est valide
      if (!email || !email.includes("@")) {
        throw new Error("Invalid email address");
      }

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await userRepository.findOne({ email });

      // Vérifier si l'invitation existe déjà pour cet email dans ce workspace
      const existingMembership =
        await WorkspaceMemberRepository.findMembershipByEmail(
          workspaceId,
          email,
        );

      if (existingMembership) {
        if (existingMembership.inviteAccepted) {
          throw new Error("User is already a member of this workspace");
        } else {
          throw new Error("User is already invited to this workspace");
        }
      }

      // Créer l'invitation avec l'email et l'ID utilisateur si disponible
      const membershipData = {
        workspace: workspaceId,
        email: email,
        role: role || WorkspaceRole.MEMBER,
        invitedBy: inviterId,
        inviteAccepted: false,
      };

      // Si l'utilisateur existe, associer également son ID
      if (existingUser) {
        membershipData.user = existingUser._id;
      }

      const membership = await WorkspaceMemberRepository.createMembership(
        membershipData,
        session,
      );

      // Envoyer l'email d'invitation
      await EmailService.sendInvitationEmail(email, workspaceName, inviterId);

      await session.commitTransaction();
      return membership;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  /**
   * Accept a workspace invitation
   */
  acceptInvitation: async (workspaceId: string, userId: string) => {
    const membership = await WorkspaceMemberRepository.acceptInvitation(
      workspaceId,
      userId,
    );

    if (!membership) {
      throw new Error("Invitation not found or already accepted");
    }

    return membership;
  },

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
