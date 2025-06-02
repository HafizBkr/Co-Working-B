import mongoose from "mongoose";
import WorkspaceRepository from "../repository/workspace.repository";
import WorkspaceMemberRepository from "../repository/workspace-member.repository";
import { WorkspaceRole } from "../models/Workspace";
import { User } from "../models/user";
import Chat from "../models/Chat";

export const WorkspaceService = {
  /**
   * Create a new workspace with the creator as owner
   */
  createWorkspace: async (workspaceData: any, userId: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get the user to retrieve their email
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const workspace = (await WorkspaceRepository.createWorkspace(
        {
          name: workspaceData.name,
          description: workspaceData.description,
          logo: workspaceData.logo,
          createdBy: new mongoose.Types.ObjectId(userId),
        },
        session,
      )) as { _id: mongoose.Types.ObjectId };

      await WorkspaceMemberRepository.createMembership(
        {
          workspace: workspace._id,
          user: new mongoose.Types.ObjectId(userId),
          email: user.email,
          role: WorkspaceRole.OWNER,
          invitedBy: new mongoose.Types.ObjectId(userId),
          inviteAccepted: true,
        },
        session,
      );

      await Chat.create({
        workspace: workspace._id,
        participants: [user._id],
        name: "Général",
        isDirectMessage: false,
        createdBy: user._id,
      });

      await session.commitTransaction();
      return workspace;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  /**
   * Get all workspaces for a user
   */
  getUserWorkspaces: async (userId: string) => {
    const workspaces = await WorkspaceRepository.getUserWorkspaces(userId);
    return workspaces;
  },

  /**
   * Get workspace details with role and member count
   */
  getWorkspaceDetails: async (workspace: any, role: string) => {
    // Get member count
    const memberCount = await WorkspaceRepository.countMembers(workspace._id);

    return {
      ...workspace.toObject(),
      role,
      memberCount,
    };
  },

  /**
   * Update workspace details
   */
  updateWorkspace: async (workspaceId: string, updateData: any) => {
    return WorkspaceRepository.updateWorkspace(workspaceId, {
      name: updateData.name,
      description: updateData.description,
      logo: updateData.logo,
    });
  },

  /**
   * Delete a workspace and all related data
   */
  deleteWorkspace: async (workspaceId: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete the workspace
      await WorkspaceRepository.deleteWorkspace(workspaceId, session);

      // Delete all workspace memberships
      await WorkspaceMemberRepository.deleteWorkspaceMemberships(
        workspaceId,
        session,
      );

      // In a complete implementation, you would also delete:
      // - Projects
      // - Tasks
      // - Documents
      // - Chats and messages
      // - etc.

      await session.commitTransaction();
      return true;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  /**
   * Check if user has admin access to workspace
   */
  hasAdminAccess: (role: string) => {
    return [WorkspaceRole.OWNER, WorkspaceRole.ADMIN].includes(
      role as WorkspaceRole,
    );
  },
};

/**
 * Create Aworkspace general chat
 */

export default WorkspaceService;
