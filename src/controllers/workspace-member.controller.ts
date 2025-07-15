import { Request, Response } from "express";
import WorkspaceMemberService from "../services/workspace-member.service";

export class WorkspaceMemberController {
  static async getWorkspaceMembers(req: Request, res: Response): Promise<void> {
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
  }

  static async updateMemberRole(req: Request, res: Response): Promise<void> {
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
  }

  static async removeMember(req: Request, res: Response): Promise<void> {
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
  }
}
