import { Request, Response } from "express";
import WorkspaceMemberService from "../services/workspace-member.service";
import {
  RESPONSE_CODES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "../utils/error_response";

export class WorkspaceMemberController {
  static async getWorkspaceMembers(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = req.params.workspaceId;

      const members =
        await WorkspaceMemberService.getWorkspaceMembers(workspaceId);

      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message:
          SUCCESS_MESSAGES.MEMBERS_FOUND || "Membres récupérés avec succès",
        data: members,
      });
    } catch (error: any) {
      console.error("Get workspace members error:", error);

      res.status(RESPONSE_CODES.SERVER_ERROR).json({
        success: false,
        message:
          error.message ||
          ERROR_MESSAGES.MEMBERS_FETCH_FAILED ||
          "Échec de la récupération des membres",
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

      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.ROLE_UPDATED,
        data: updatedMember,
      });
    } catch (error: any) {
      console.error("Update member role error:", error);

      let status = RESPONSE_CODES.SERVER_ERROR;
      let message = error.message || ERROR_MESSAGES.ROLE_NOT_ALLOWED;

      if (error.message.includes("not found")) {
        status = RESPONSE_CODES.NOT_FOUND;
        message = ERROR_MESSAGES.MEMBER_NOT_FOUND;
      } else if (error.message.includes("owner")) {
        status = RESPONSE_CODES.FORBIDDEN;
        message = ERROR_MESSAGES.OWNER_REQUIRED;
      }

      res.status(status).json({
        success: false,
        message,
      });
    }
  }

  static async removeMember(req: Request, res: Response): Promise<void> {
    try {
      const { memberId } = req.params;
      const workspaceId = req.params.workspaceId;

      await WorkspaceMemberService.removeMember(workspaceId, memberId);

      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.MEMBER_REMOVED,
      });
    } catch (error: any) {
      console.error("Remove member error:", error);

      let status = RESPONSE_CODES.SERVER_ERROR;
      let message = error.message || ERROR_MESSAGES.MEMBER_NOT_FOUND;

      if (error.message.includes("not found")) {
        status = RESPONSE_CODES.NOT_FOUND;
        message = ERROR_MESSAGES.MEMBER_NOT_FOUND;
      } else if (error.message.includes("owner")) {
        status = RESPONSE_CODES.FORBIDDEN;
        message = ERROR_MESSAGES.OWNER_REQUIRED;
      }

      res.status(status).json({
        success: false,
        message,
      });
    }
  }
}
