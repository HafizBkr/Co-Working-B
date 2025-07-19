import { Request, Response } from "express";
import { WorkspaceInvitationService } from "../services/workspace-invitation.service";
import {
  RESPONSE_CODES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "../utils/error_response";

export class WorkspaceInvitationController {
  static async inviteToWorkspace(req: Request, res: Response): Promise<void> {
    try {
      const { emails, role } = req.body;
      const { workspaceId } = req.params;
      const inviterId = req.user?.userId;
      const workspaceName = req.workspace?.name;

      if (!inviterId) {
        res
          .status(RESPONSE_CODES.UNAUTHORIZED)
          .json({ success: false, message: ERROR_MESSAGES.UNAUTHORIZED });
        return;
      }

      if (!workspaceName) {
        res.status(RESPONSE_CODES.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.WORKSPACE_NOT_FOUND,
        });
        return;
      }

      if (!Array.isArray(emails)) {
        res
          .status(RESPONSE_CODES.BAD_REQUEST)
          .json({ success: false, message: ERROR_MESSAGES.INVALID_PAYLOAD });
        return;
      }

      const results = await Promise.all(
        emails.map(async (email) => {
          try {
            const result = await WorkspaceInvitationService.invite(
              email,
              workspaceId,
              role,
              inviterId,
              workspaceName,
            );
            return { email, success: true, data: result };
          } catch (e: any) {
            return { email, success: false, message: e.message };
          }
        }),
      );

      res.status(RESPONSE_CODES.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.INVITATION_SENT,
        results,
      });
    } catch (e: any) {
      res.status(RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: e.message || ERROR_MESSAGES.INVITATION_NOT_FOUND,
      });
    }
  }

  static async acceptInvitationByToken(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { token } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res
          .status(RESPONSE_CODES.UNAUTHORIZED)
          .json({ success: false, message: ERROR_MESSAGES.UNAUTHORIZED });
        return;
      }

      await WorkspaceInvitationService.accept(token, userId);

      res.status(RESPONSE_CODES.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.INVITATION_ACCEPTED,
      });
    } catch (e: any) {
      res.status(RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: e.message || ERROR_MESSAGES.INVITATION_NOT_FOUND,
      });
    }
  }

  static async registerAndAcceptInvitation(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { token, ...userData } = req.body;

      const user = await WorkspaceInvitationService.registerAndAccept(
        token,
        userData,
      );

      res.status(RESPONSE_CODES.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.INVITATION_ACCEPTED,
        user,
      });
    } catch (e: any) {
      res.status(RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: e.message || ERROR_MESSAGES.INVITATION_NOT_FOUND,
      });
    }
  }
}
