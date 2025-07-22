export const RESPONSE_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
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
  MEMBERS_FETCH_FAILED: "Échec de la récupération des membres.",
  WORKSPACES_FETCH_FAILED: "Échec de la récupération des workspaces.",
  WORKSPACE_FETCH_FAILED: "Échec de la récupération du workspace.",

  // ==== VIDEO CONFERENCE SPECIFIQUES ====
  SESSION_CREATION_FAILED: "Échec de la création de la session vidéo.",
  SESSIONS_NOT_FOUND: "Aucune session vidéo trouvée.",
  SESSION_NOT_FOUND: "Session vidéo introuvable.",
  SESSION_END_FAILED: "Échec de la fermeture de la session vidéo.",
  PARTICIPANTS_NOT_FOUND: "Aucun participant trouvé dans la session.",
  MEDIA_UPDATE_FAILED: "Échec de la mise à jour des paramètres média.",
  ACCESS_CHECK_FAILED: "Impossible de vérifier l'accès à la session.",
  SESSION_FULL: "La session est pleine.",
  SESSION_ENDED: "La session est terminée.",
  NOT_SESSION_MEMBER: "Vous n'êtes pas membre de cette session.",

  // ==== PROJECT/PROJET SPÉCIFIQUES ====
  PROJECT_USER_NOT_AUTHENTICATED: "Utilisateur non authentifié.",
  PROJECT_NOT_FOUND: "Projet non trouvé.",
  PROJECT_CREATION_FAILED: "Échec de la création du projet.",
  PROJECT_UPDATE_FAILED: "Échec de la mise à jour du projet.",
  PROJECT_DELETE_FAILED: "Échec de la suppression du projet.",
  PROJECT_DUPLICATE_NAME_REQUIRED:
    "Le nouveau nom est requis pour la duplication.",
  PROJECT_DATES_REQUIRED: "Les dates de début et de fin sont requises.",
  PROJECT_ARCHIVE_FAILED: "Échec de l'archivage du projet.",
  PROJECT_PERIOD_REQUIRED:
    "Les dates de début et de fin sont requises pour la période.",
  PROJECT_STATS_FAILED: "Échec de la récupération des statistiques du projet.",
  PROJECT_STATUS_FAILED: "Échec de la récupération du statut du projet.",
  PROJECTS_FETCH_FAILED: "Échec de la récupération des projets.",
  PROJECTS_ACTIVE_FETCH_FAILED: "Échec de la récupération des projets actifs.",
  PROJECTS_OVERDUE_FETCH_FAILED:
    "Échec de la récupération des projets en retard.",
  PROJECTS_COMPLETED_FETCH_FAILED:
    "Échec de la récupération des projets terminés.",
  PROJECT_DUPLICATE_FAILED: "Échec de la duplication du projet.",
  PROJECT_UPDATE_DATES_FAILED: "Échec de la mise à jour des dates du projet.",
  PROJECT_ID_REQUIRED: "L'identifiant du projet est requis.",
  PROJECT_NAME_REQUIRED: "Le nom du projet est requis.",
  PROJECT_ALREADY_EXISTS:
    "Un projet avec ce nom existe déjà dans ce workspace.",
  PROJECT_INVALID_DATES:
    "Les dates de début et de fin du projet sont invalides.",
  PROJECT_INVALID_PAYLOAD: "Les données du projet sont invalides.",
  PROJECT_NOT_ACTIVE: "Le projet n'est pas actif.",
  PROJECT_NOT_OVERDUE: "Le projet n'est pas en retard.",
  PROJECT_NOT_COMPLETED: "Le projet n'est pas terminé.",
  PROJECT_PERIOD_INVALID: "La période spécifiée est invalide.",
  PROJECT_ACCESS_DENIED: "Vous n'avez pas accès à ce projet.",

  // ==== CHAT/CONVERSATION SPECIFIQUES ====
  CHAT_USER_ID_REQUIRED:
    "L'identifiant utilisateur est requis pour cette opération de chat.",
  CHAT_NOT_FOUND: "Conversation introuvable.",
  CHAT_FAILED_CREATE: "Échec de la création de la conversation.",
  CHAT_FAILED_GET: "Échec de la récupération de la conversation.",
  CHAT_FAILED_GET_LIST: "Échec de la récupération des conversations.",
  CHAT_FAILED_MARK_READ: "Impossible de marquer les messages comme lus.",
  CHAT_FAILED_SEND_MESSAGE: "Impossible d'envoyer le message.",
  CHAT_MESSAGE_ID_REQUIRED: "L'identifiant du message est requis.",
  CHAT_MESSAGE_CONTENT_REQUIRED: "Le contenu du message est requis.",
  CHAT_MESSAGE_NOT_FOUND: "Message introuvable.",
  CHAT_MESSAGE_FORBIDDEN: "Vous n'avez pas accès à ce message.",
  CHAT_MESSAGE_EDIT_FORBIDDEN:
    "Vous ne pouvez modifier que vos propres messages.",
  CHAT_MESSAGE_DELETE_FORBIDDEN:
    "Vous ne pouvez supprimer que vos propres messages.",
  CHAT_MESSAGE_TOO_OLD:
    "Le message est trop ancien pour être modifié ou supprimé.",
  CHAT_FAILED_UPDATE_MESSAGE: "Impossible de mettre à jour le message.",
  CHAT_FAILED_DELETE_MESSAGE: "Impossible de supprimer le message.",
  CHAT_DIRECT_CREATION_PAYLOAD:
    "workspaceId et userId sont requis pour créer une conversation directe.",
  // ==== TASK/TÂCHE SPÉCIFIQUES ====
  TASK_NOT_FOUND: "Tâche introuvable.",
  TASK_CREATION_FAILED: "Échec de la création de la tâche.",
  TASK_UPDATE_FAILED: "Échec de la mise à jour de la tâche.",
  TASK_DELETE_FAILED: "Échec de la suppression de la tâche.",
  TASK_ASSIGN_FAILED: "Échec de l'assignation de la tâche.",
  TASK_STATUS_CHANGE_FAILED: "Échec du changement de statut de la tâche.",
  TASK_INVALID_PAYLOAD: "Les données de la tâche sont invalides.",
  TASK_ALREADY_EXISTS: "Une tâche avec ce nom existe déjà dans ce projet.",
  TASK_ACCESS_DENIED: "Vous n'avez pas accès à cette tâche.",
  TASK_WORKSPACE_MISMATCH:
    "L'identifiant du workspace ne correspond pas à celui de la tâche.",
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
  MEMBERS_FOUND: "Membres récupérés avec succès.",
  WORKSPACES_FOUND: "Workspaces récupérés avec succès.",
  WORKSPACE_FOUND: "Workspace récupéré avec succès.",

  // ==== VIDEO CONFERENCE SUCCÈS ====
  SESSION_CREATED: "Session vidéo créée avec succès.",
  SESSIONS_FOUND: "Sessions vidéo récupérées avec succès.",
  PARTICIPANTS_FOUND: "Participants récupérés avec succès.",
  SESSION_ENDED: "Session vidéo terminée avec succès.",
  MEDIA_UPDATED: "Paramètres média mis à jour avec succès.",

  // ==== CHAT/CONVERSATION SUCCÈS ====
  CHAT_CREATED: "Conversation créée avec succès.",
  CHAT_MESSAGE_SENT: "Message envoyé avec succès.",
  CHAT_MESSAGE_UPDATED: "Message mis à jour avec succès.",
  CHAT_MESSAGE_DELETED: "Message supprimé avec succès.",
  CHAT_MESSAGE_SOFT_DELETED: "Message supprimé (soft delete) avec succès.",
  CHAT_MESSAGES_MARKED_READ: "Messages marqués comme lus.",

  // ==== PROJECT/PROJET SUCCÈS ====
  PROJECT_CREATED: "Projet créé avec succès.",
  PROJECT_UPDATED: "Projet mis à jour avec succès.",
  PROJECT_DELETED: "Projet supprimé avec succès.",
  PROJECT_DUPLICATED: "Projet dupliqué avec succès.",
  PROJECT_ARCHIVED: "Projet archivé avec succès.",
  PROJECT_DATES_UPDATED: "Dates du projet mises à jour avec succès.",
  PROJECT_FOUND: "Projet récupéré avec succès.",
  PROJECTS_FOUND: "Projets récupérés avec succès.",
  PROJECT_STATS_FOUND: "Statistiques du projet récupérées avec succès.",
  PROJECT_STATUS_FOUND: "Statut du projet récupéré avec succès.",
  PROJECTS_ACTIVE_FOUND: "Projets actifs récupérés avec succès.",
  PROJECTS_OVERDUE_FOUND: "Projets en retard récupérés avec succès.",
  PROJECTS_COMPLETED_FOUND: "Projets terminés récupérés avec succès.",
  PROJECTS_PERIOD_FOUND: "Projets de la période récupérés avec succès.",

  // ==== TASK/TÂCHE SUCCÈS ====
  TASK_CREATED: "Tâche créée avec succès.",
  TASK_UPDATED: "Tâche mise à jour avec succès.",
  TASK_DELETED: "Tâche supprimée avec succès.",
  TASK_FOUND: "Tâche récupérée avec succès.",
  TASKS_FOUND: "Tâches récupérées avec succès.",
  TASK_ASSIGNED: "Tâche assignée avec succès.",
  TASK_STATUS_CHANGED: "Statut de la tâche modifié avec succès.",
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
