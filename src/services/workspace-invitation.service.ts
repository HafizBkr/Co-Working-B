import { v4 as uuidv4 } from "uuid";
import WorkspaceInvitationRepository from "../repository/workspace-invitation.repository";
import WorkspaceMemberRepository from "../repository/workspace-member.repository";
import { UserRepository } from "../repository/UserRepository";
import { EmailService } from "./email.service";
import { WorkspaceRole } from "../models/Workspace";

export const WorkspaceInvitationService = {
  async invite(email, workspaceId, role, inviterId, workspaceName) {
    const userRepository = new UserRepository();
    const existingUser = await userRepository.findOne({ email });

    const existingMembership =
      await WorkspaceMemberRepository.findMembershipByEmail(workspaceId, email);
    if (existingMembership) {
      throw new Error("User is already invited to this workspace");
    }

    // Générer un token
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Créer l’invitation
    const invitation = await WorkspaceInvitationRepository.createInvitation({
      email,
      workspace: workspaceId,
      role: role || WorkspaceRole.MEMBER,
      invitedBy: inviterId,
      token,
      expiresAt,
      status: "pending",
    });

    // Créer le membre avec inviteAccepted: false
    await WorkspaceMemberRepository.createMembership({
      workspace: workspaceId,
      user: existingUser ? existingUser._id : undefined,
      email,
      role: role || WorkspaceRole.MEMBER,
      invitedBy: inviterId,
      inviteAccepted: false,
    });

    // Envoi de l’email d’invitation avec le token
    await EmailService.sendInvitationEmail(
      email,
      workspaceName,
      inviterId,
      token,
    );

    return invitation;
  },

  async accept(token, userId) {
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

    // Trouver le membre existant (créé à l'invitation)
    const membership = await WorkspaceMemberRepository.findMembershipByEmail(
      invitation.workspace,
      invitation.email,
    );
    if (!membership) {
      throw new Error("Membership not found for this invitation");
    }

    membership.inviteAccepted = true;
    membership.user = userId;
    await membership.save();

    // Marquer l’invitation comme acceptée
    await WorkspaceInvitationRepository.setStatus(token, "accepted");
    return true;
  },

  async registerAndAccept(token, userData) {
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

    // Ici, l'utilisateur vient d'être créé, il n'est pas encore vérifié
    // On ne crée PAS le membre tant que l'email n'est pas vérifié
    // On met à jour le statut de l'invitation pour indiquer qu'on attend la vérification
    await WorkspaceInvitationRepository.setStatus(
      token,
      "waiting_verification",
    );

    // Retourne un message explicite au frontend
    return {
      message:
        "Un email de vérification vous a été envoyé. Veuillez valider votre compte pour finaliser l'invitation.",
      userId: user._id,
      email: user.email,
      needEmailVerification: true,
    };
  },
  async activateInvitationForUser(email: string) {
    // 1. Trouver l'invitation en attente pour cet email
    const invitation = await WorkspaceInvitationRepository.findOne({
      email: email.toLowerCase(),
      status: { $in: ["pending", "waiting_verification"] },
      expiresAt: { $gt: new Date() },
    });
    if (!invitation)
      throw new Error("Aucune invitation en attente pour cet email");

    // 2. Trouver le user
    const userRepository = new UserRepository();
    const user = await userRepository.findOne({ email });
    if (!user) throw new Error("Utilisateur introuvable");

    // 3. Mettre à jour le membre du workspace
    const membership = await WorkspaceMemberRepository.findMembershipByEmail(
      invitation.workspace,
      email,
    );
    if (!membership) throw new Error("Membership introuvable");

    membership.inviteAccepted = true;
    membership.user = user._id;
    await membership.save();

    // 4. Mettre à jour le statut de l'invitation
    await WorkspaceInvitationRepository.setStatus(invitation.token, "accepted");

    return {
      success: true,
      message: "Invitation activée et accès au workspace accordé.",
    };
  },
};
