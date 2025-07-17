export const RESPONSE_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
};

export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Vous devez être authentifié pour accéder à cette ressource.",
  INVALID_WORKSPACE_ID: "Identifiant du workspace invalide.",
  WORKSPACE_NOT_FOUND: "Workspace introuvable.",
  ACCESS_DENIED: "Accès refusé à ce workspace.",
  ADMIN_OR_OWNER_REQUIRED:
    "Accès réservé aux administrateurs ou propriétaires.",
  OWNER_REQUIRED: "Accès réservé au propriétaire du workspace.",
  MEMBER_NOT_FOUND: "Membre du workspace introuvable.",
  ROLE_NOT_ALLOWED: "Modification du rôle non autorisée.",
  INVITATION_NOT_FOUND: "Invitation introuvable.",
  USER_NOT_FOUND: "Utilisateur introuvable.",
  SERVER_ERROR: "Une erreur interne est survenue.",
  INVALID_PAYLOAD: "Données de requête invalides.",
  INVALID_AUTH_PAYLOAD: "Email, mot de passe et nom d'utilisateur sont requis.",
  EMAIL_ALREADY_USED: "Cet email est déjà utilisé dans ce workspace.",
  INVITE_NOT_ACCEPTED: "L'invitation n'a pas été acceptée.",
  INVALID_EMAIL_OR_PASSWORD: "Email ou mot de passe invalide.",
  EMAIL_NOT_VERIFIED:
    "Email non vérifié. Un nouveau code de vérification a été envoyé.",
  INVALID_VERIFICATION_CODE: "Code de vérification invalide.",
  INVALID_RESET_CODE: "Code de réinitialisation invalide.",
  PASSWORD_REQUIRED: "Le mot de passe est requis.",
  EMAIL_REQUIRED: "L'email est requis.",
  USER_ALREADY_EXISTS: "Un utilisateur avec cet email existe déjà.",
  PASSWORD_RESET_FAILED: "La réinitialisation du mot de passe a échoué.",
  OTP_SEND_FAILED: "L'envoi du code OTP a échoué.",
  OTP_REQUIRED: "Le code OTP est requis.",
};

export const SUCCESS_MESSAGES = {
  USER_CREATED:
    "Utilisateur enregistré avec succès. Veuillez vérifier votre email pour le code de vérification.",
  USER_LOGGED_IN: "Connexion réussie.",
  EMAIL_VERIFIED: "Email vérifié avec succès.",
  PASSWORD_RESET_CODE_SENT: "Code de réinitialisation envoyé à votre email.",
  PASSWORD_RESET_SUCCESS: "Mot de passe réinitialisé avec succès.",
  MEMBER_REMOVED: "Membre supprimé avec succès.",
  ROLE_UPDATED: "Rôle du membre mis à jour.",
  INVITATION_SENT: "Invitation envoyée.",
  INVITATION_ACCEPTED: "Invitation acceptée.",
  INVITATION_REJECTED: "Invitation refusée.",
  WORKSPACE_CREATED: "Workspace créé avec succès.",
  WORKSPACE_UPDATED: "Workspace mis à jour.",
  WORKSPACE_DELETED: "Workspace supprimé.",
  OTP_SENT: "Nouveau code de vérification envoyé à votre email.",
  RESET_CODE_VERIFIED: "Code de réinitialisation vérifié avec succès.",
};

export const HTTP_RESPONSES = {
  SUCCESS: { success: true },
  FAILURE: { success: false },
};

export const REQUEST_CONSTANTS = {
  MAX_INVITATION_EXPIRY_DAYS: 7,
  DEFAULT_MEMBER_ROLE: "member",
  ROLES: ["owner", "admin", "member", "guest"],
  INVITATION_STATUS: [
    "pending",
    "accepted",
    "rejected",
    "expired",
    "waiting_verification",
  ],
};
