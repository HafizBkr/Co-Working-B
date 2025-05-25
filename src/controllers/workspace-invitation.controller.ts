import { WorkspaceInvitationService } from "../services/workspace-invitation.service";

export const inviteToWorkspace = async (req, res) => {
  try {
    const { email, role } = req.body;
    const { workspaceId } = req.params;
    const inviterId = req.user.userId;
    const workspaceName = req.workspace.name;
    const result = await WorkspaceInvitationService.invite(
      email,
      workspaceId,
      role,
      inviterId,
      workspaceName,
    );
    res.status(201).json({ success: true, data: result });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const acceptInvitationByToken = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.userId;
    await WorkspaceInvitationService.accept(token, userId);
    res.json({ success: true, message: "Invitation acceptée" });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const registerAndAcceptInvitation = async (req, res) => {
  try {
    const { token, ...userData } = req.body;
    const user = await WorkspaceInvitationService.registerAndAccept(
      token,
      userData,
    );
    res.status(201).json({ success: true, user });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};
