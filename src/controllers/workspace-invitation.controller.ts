import { Request, Response } from "express";
import { WorkspaceInvitationService } from "../services/workspace-invitation.service";

export class WorkspaceInvitationController {
  static async inviteToWorkspace(req: Request, res: Response): Promise<void> {
    try {
      const { emails, role } = req.body;
      const { workspaceId } = req.params;
      const inviterId = req.user.userId;
      const workspaceName = req.workspace.name;

      if (!Array.isArray(emails)) {
        return res
          .status(400)
          .json({ success: false, message: "emails must be an array" });
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

      res.status(201).json({ success: true, results });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  static async acceptInvitationByToken(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { token } = req.body;
      const userId = req.user.userId;

      await WorkspaceInvitationService.accept(token, userId);

      res.json({ success: true, message: "Invitation acceptée" });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
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

      res.status(201).json({ success: true, user });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  }
}
