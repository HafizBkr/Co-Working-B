import { Request, Response } from "express";
import WorkspaceMemberService from "../services/workspace-member.service";

export const inviteToWorkspace = async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;
    const workspaceId = req.params.workspaceId;
    const inviterId = req.user?.userId || "";
    const workspaceName = req.workspace.name;

    const membership = await WorkspaceMemberService.inviteUserToWorkspace(
      workspaceId,
      email,
      role,
      inviterId,
      workspaceName,
    );

    res.status(201).json({
      success: true,
      data: membership,
    });
  } catch (error: any) {
    console.error("Invite to workspace error:", error);

    res.status(error.message.includes("already") ? 400 : 500).json({
      success: false,
      message: error.message || "Failed to send invitation",
    });
  }
};

// Accept an invitation
export const acceptInvitation = async (req: Request, res: Response) => {
  try {
    const workspaceId = req.params.workspaceId;
    const userId = req.user?.userId || "";

    const membership = await WorkspaceMemberService.acceptInvitation(
      workspaceId,
      userId,
    );

    res.status(200).json({
      success: true,
      data: membership,
    });
  } catch (error: any) {
    console.error("Accept invitation error:", error);

    res.status(404).json({
      success: false,
      message: error.message || "Failed to accept invitation",
    });
  }
};

// Get all members of a workspace
export const getWorkspaceMembers = async (req: Request, res: Response) => {
  try {
    const workspaceId = req.params.workspaceId;

    const members =
      await WorkspaceMemberService.getWorkspaceMembers(workspaceId);

    res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error: any) {
    console.error("Get workspace members error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to get workspace members",
    });
  }
};

// Update member role
export const updateMemberRole = async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const { role } = req.body;
    const workspaceId = req.params.workspaceId;

    const updatedMember = await WorkspaceMemberService.updateMemberRole(
      workspaceId,
      memberId,
      role,
    );

    res.status(200).json({
      success: true,
      data: updatedMember,
    });
  } catch (error: any) {
    console.error("Update member role error:", error);

    const status = error.message.includes("not found")
      ? 404
      : error.message.includes("owner")
        ? 403
        : 500;

    res.status(status).json({
      success: false,
      message: error.message || "Failed to update member role",
    });
  }
};

// Remove a member from workspace
export const removeMember = async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const workspaceId = req.params.workspaceId;

    await WorkspaceMemberService.removeMember(workspaceId, memberId);

    res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error: any) {
    console.error("Remove member error:", error);

    const status = error.message.includes("not found")
      ? 404
      : error.message.includes("owner")
        ? 403
        : 500;

    res.status(status).json({
      success: false,
      message: error.message || "Failed to remove member",
    });
  }
};
