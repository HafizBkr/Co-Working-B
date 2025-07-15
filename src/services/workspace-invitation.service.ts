import { v4 as uuidv4 } from "uuid";
import mongoose, { Types } from "mongoose";
import WorkspaceInvitationRepository from "../repository/workspace-invitation.repository";
import WorkspaceMemberRepository from "../repository/workspace-member.repository";
import { UserRepository } from "../repository/User.repository";
import { EmailService } from "./invitation-email.service";
import { WorkspaceRole } from "../models/Workspace";
import Chat from "../models/Chat";
import { IUser } from "../models/user"; // Si tu as un type User

export interface InviteResult {
  reinvited?: boolean;
  invited?: boolean;
  email: string;
  message: string;
}

export interface RegisterAndAcceptResult {
  message: string;
  userId: Types.ObjectId;
  email: string;
  needEmailVerification: boolean;
}

export interface ActivateInvitationResult {
  success: boolean;
  message: string;
}

export const WorkspaceInvitationService = {
  async invite(
    email: string,
    workspaceId: string,
    role: WorkspaceRole,
    inviterId: string,
    workspaceName: string,
  ): Promise<InviteResult> {
    const userRepository = new UserRepository();
    const existingUser = await userRepository.findOne({ email });

    const existingMembership =
      await WorkspaceMemberRepository.findMembershipByEmail(workspaceId, email);

    const existingInvitation = await WorkspaceInvitationRepository.findOne({
      workspace: new mongoose.Types.ObjectId(workspaceId),
      email: email.toLowerCase(),
      status: "pending",
    });

    if (existingMembership && existingMembership.inviteAccepted === true) {
      throw new Error("User is already a member of this workspace");
    }

    // SUPPRESSION de l'invitation précédente si elle existe et n'est pas acceptée
    if (existingInvitation) {
      await WorkspaceInvitationRepository.deleteOne({
        _id: existingInvitation._id,
      });
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

    const invitation = await WorkspaceInvitationRepository.createInvitation({
      email,
      workspace: new mongoose.Types.ObjectId(workspaceId),
      role: role || WorkspaceRole.MEMBER,
      invitedBy: new mongoose.Types.ObjectId(inviterId),
      token,
      expiresAt,
      status: "pending",
    });

    // Crée un membre si l'utilisateur existe
    if (existingUser) {
      await WorkspaceMemberRepository.createMembership({
        workspace: new mongoose.Types.ObjectId(workspaceId),
        user: existingUser._id as mongoose.Types.ObjectId,
        email,
        role: role || WorkspaceRole.MEMBER,
        invitedBy: new mongoose.Types.ObjectId(inviterId),
        inviteAccepted: false,
      });

      await Chat.findOneAndUpdate(
        {
          workspace: new mongoose.Types.ObjectId(workspaceId),
          isDirectMessage: false,
          name: "Général",
        },
        { $addToSet: { participants: existingUser._id } },
      );
    }

    await EmailService.sendInvitationEmail(
      email,
      workspaceName,
      inviterId,
      token,
      !!existingUser,
    );

    return {
      invited: true,
      email,
      message: "Invitation sent successfully",
    };
  },

  async accept(token: string, userId: string): Promise<boolean> {
    const invitation = await WorkspaceInvitationRepository.findByToken(token);
    if (
      !invitation ||
      invitation.status !== "pending" ||
      invitation.expiresAt < new Date()
    ) {
      throw new Error("Invitation invalide ou expirée");
    }
    const userRepository = new UserRepository();
    const user = await userRepository.findById(userId);
    if (!user || user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new Error("Email ne correspond pas à l’invitation");
    }

    const membership = await WorkspaceMemberRepository.findMembershipByEmail(
      invitation.workspace.toString(),
      invitation.email,
    );
    if (!membership) {
      throw new Error("Membership not found for this invitation");
    }

    membership.inviteAccepted = true;
    membership.user = new mongoose.Types.ObjectId(userId);
    await membership.save();

    await Chat.findOneAndUpdate(
      {
        workspace: invitation.workspace,
        isDirectMessage: false,
        name: "Général",
      },
      { $addToSet: { participants: new mongoose.Types.ObjectId(userId) } },
    );

    await WorkspaceInvitationRepository.setStatus(token, "accepted");
    return true;
  },

  async registerAndAccept(
    token: string,
    userData: IUser,
  ): Promise<RegisterAndAcceptResult> {
    const invitation = await WorkspaceInvitationRepository.findByToken(token);
    if (
      !invitation ||
      invitation.status !== "pending" ||
      invitation.expiresAt < new Date()
    ) {
      throw new Error("Invitation invalide ou expirée");
    }
    if (userData.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new Error("Email ne correspond pas à l’invitation");
    }
    const userRepository = new UserRepository();
    const user = await userRepository.register(userData);

    if (!user) {
      throw new Error(
        "Erreur création utilisateur ou email déjà utilisé. Essayez de vous connecter ou de vérifier votre email.",
      );
    }

    await WorkspaceInvitationRepository.setStatus(
      token,
      "waiting_verification",
    );

    return {
      message:
        "Un email de vérification vous a été envoyé. Veuillez valider votre compte pour finaliser l'invitation.",
      userId: user._id as mongoose.Types.ObjectId,
      email: user.email,
      needEmailVerification: true,
    };
  },

  async activateInvitationForUser(
    email: string,
  ): Promise<ActivateInvitationResult> {
    const invitation = await WorkspaceInvitationRepository.findOne({
      email: email.toLowerCase(),
      status: { $in: ["pending", "waiting_verification"] },
      expiresAt: { $gt: new Date() },
    });
    if (!invitation)
      throw new Error("Aucune invitation en attente pour cet email");

    const userRepository = new UserRepository();
    const user = (await userRepository.findOne({ email })) as IUser | null;
    if (!user) throw new Error("Utilisateur introuvable");

    const membership = await WorkspaceMemberRepository.findMembershipByEmail(
      invitation.workspace.toString(),
      email,
    );
    if (!membership) throw new Error("Membership introuvable");

    membership.inviteAccepted = true;
    membership.user = user._id as Types.ObjectId;
    await membership.save();

    await Chat.findOneAndUpdate(
      {
        workspace: invitation.workspace,
        isDirectMessage: false,
        name: "Général",
      },
      { $addToSet: { participants: user._id as Types.ObjectId } },
    );

    await WorkspaceInvitationRepository.setStatus(invitation.token, "accepted");

    return {
      success: true,
      message: "Invitation activée et accès au workspace accordé.",
    };
  },
};
