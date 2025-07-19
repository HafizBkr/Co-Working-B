/**
 * Script de test pour les fonctionnalités de chat en temps réel
 * Ce script utilise Socket.IO pour se connecter au serveur et tester les fonctionnalités
 * de chat en temps réel, notamment la récupération des membres et derniers messages.
 */

// Configuration
const API_URL = "http://localhost:5000/api/v1";
const SOCKET_URL = "http://localhost:5000";
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODc2MjgwZDcwMTM1M2Q3OWFlYzM0ZGEiLCJlbWFpbCI6ImhhZml6aW5vdnVzQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJpYXQiOjE3NTI1ODA0MTYsImV4cCI6MTc1Mjc1MzIxNn0.v3rPLK6jsxH8REzum9b61Pd_r2P550qsDVgHx0PnH3U"; // Remplacez par un token JWT valide
const WORKSPACE_ID = "687629c0701353d79aec3509"; // Remplacez par l'ID du workspace à tester

// Variables globales
let socket;
let chatMembers = [];
let generalChat = null;
let currentUserId = null;
let activeChats = {};

// Fonction principale
window.init = async function() {
  console.log("=== TEST DU CHAT EN TEMPS RÉEL ===");

  try {
    // 1. Vérifier que le token est valide en récupérant l'utilisateur courant
    await fetchCurrentUser();

    // 2. Récupérer les membres de chat
    await fetchChatMembers();

    // 3. Connexion au socket
    connectSocket();

    // 4. Rejoindre le workspace
    joinWorkspace();

    // 5. Tester l'envoi d'un message au chat général
    if (generalChat) {
      setTimeout(() => {
        console.log("Envoi d'un message au chat général...");
        sendMessage(
          generalChat._id,
          "Bonjour à tous ! Test du chat en temps réel.",
        );
      }, 2000);
    }

    // 6. Tester l'envoi d'un message direct (si disponible)
    if (chatMembers.length > 0 && chatMembers[0].chatId) {
      setTimeout(() => {
        console.log(
          `Envoi d'un message direct à ${chatMembers[0].user.username}...`,
        );
        sendMessage(
          chatMembers[0].chatId,
          `Bonjour ${chatMembers[0].user.username} ! Test du message direct.`,
        );
      }, 4000);
    } else if (chatMembers.length > 0) {
      // Créer un nouveau chat direct si nécessaire
      setTimeout(() => {
        console.log(
          `Création d'un chat direct avec ${chatMembers[0].user.username}...`,
        );
        createDirectChat(chatMembers[0].user._id);
      }, 4000);
    }
  } catch (error) {
    console.error("Erreur lors de l'initialisation:", error);
  }
}

// Récupérer l'utilisateur courant
async function fetchCurrentUser() {
  const API_URL = window.API_URL;
  const TOKEN = window.TOKEN;
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    currentUserId = data.data._id;
    console.log("Utilisateur connecté:", data.data.username);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    throw error;
  }
}

// Récupérer les membres de chat
async function fetchChatMembers() {
  const API_URL = window.API_URL;
  const TOKEN = window.TOKEN;
  const WORKSPACE_ID = window.WORKSPACE_ID;
  try {
    const response = await fetch(
      `${API_URL}/chat-members/workspace/${WORKSPACE_ID}/members`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    window.chatMembers = data.data.members;
    window.generalChat = data.data.generalChat;

    console.log('=== MEMBRES DE CHAT ===');
    window.chatMembers.forEach(member => {
      console.log(
        `- ${member.user.username} ${member.online ? "(en ligne)" : "(hors ligne)"}`,
      );
      if (member.lastMessage) {
        console.log(
          `  Dernier message: ${member.lastMessage.content.substring(0, 30)}...`,
        );
        console.log(`  Non lus: ${member.unreadCount}`);
      }
    });

    console.log("=== CHAT GÉNÉRAL ===");
    console.log(
      `- ${generalChat.name} (${generalChat.participants} participants)`,
    );
    if (generalChat.lastMessage) {
      console.log(
        `  Dernier message: ${generalChat.lastMessage.content.substring(0, 30)}...`,
      );
      console.log(`  Non lus: ${generalChat.unreadCount}`);
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des membres de chat:", error);
    throw error;
  }
}

// Récupérer les statistiques de chat
async function fetchChatStats() {
  try {
    const response = await fetch(
      `${API_URL}/chat-members/workspace/${WORKSPACE_ID}/stats`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log("=== STATISTIQUES DE CHAT ===");
    console.log(`Total chats: ${data.data.totalChats}`);
    console.log(`Total messages: ${data.data.totalMessages}`);
    console.log(`Non lus: ${data.data.totalUnread}`);
    console.log(`Chats avec non lus: ${data.data.chatsWithUnread}`);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des statistiques de chat:",
      error,
    );
  }
}

// Connexion au socket
function connectSocket() {
  socket = io(SOCKET_URL, {
    auth: {
      token: TOKEN,
    },
  });

  socket.on("connect", () => {
    console.log("Socket connecté!");
  });

  socket.on("error", (error) => {
    console.error("Erreur socket:", error);
  });

  // Écouter les événements liés au chat
  socket.on("new-message", (data) => {
    console.log(
      `Nouveau message reçu dans le chat ${data.chat}:`,
      data.content,
    );
  });

  socket.on("message-updated", (data) => {
    console.log(`Message mis à jour dans le chat ${data.chat}:`, data.content);
  });

  socket.on("message-deleted", (data) => {
    console.log(`Message supprimé: ${data.messageId}`);
  });

  socket.on("chat-updated", (data) => {
    console.log(`Chat mis à jour: ${data.chatId}`);
    console.log(`Dernier message: ${data.lastMessage.content}`);
  });

  socket.on("user-joined-chat", (data) => {
    console.log(`Utilisateur ${data.userId} a rejoint le chat ${data.chatId}`);
  });

  socket.on("user-left-chat", (data) => {
    console.log(`Utilisateur ${data.userId} a quitté le chat ${data.chatId}`);
  });

  socket.on("user-typing", (data) => {
    console.log(
      `Utilisateur ${data.userId} est en train d'écrire dans le chat ${data.chatId}`,
    );
  });

  socket.on("user-stopped-typing", (data) => {
    console.log(
      `Utilisateur ${data.userId} a arrêté d'écrire dans le chat ${data.chatId}`,
    );
  });

  socket.on("messages-read", (data) => {
    console.log(`Messages lus par ${data.userId} dans le chat ${data.chatId}`);
  });
}

// Rejoindre un workspace
function joinWorkspace() {
  socket.emit("join-workspace", WORKSPACE_ID);

  socket.on("workspace-joined", (data) => {
    console.log(`Workspace rejoint: ${data.workspaceId}`);

    // Rejoindre le chat général
    if (generalChat) {
      joinChat(generalChat._id);
    }

    // Rejoindre les chats directs existants
    chatMembers.forEach((member) => {
      if (member.chatId) {
        joinChat(member.chatId);
      }
    });
  });

  socket.on("active-users", (users) => {
    console.log("Utilisateurs actifs:", users.length);
  });
}

// Rejoindre un chat
function joinChat(chatId) {
  socket.emit("join-chat", chatId);

  socket.on("chat-joined", (data) => {
    if (data.chatId === chatId) {
      console.log(`Chat rejoint: ${chatId}`);
      activeChats[chatId] = true;
    }
  });
}

// Quitter un chat
function leaveChat(chatId) {
  socket.emit("leave-chat", chatId);

  socket.on("chat-left", (data) => {
    if (data.chatId === chatId) {
      console.log(`Chat quitté: ${chatId}`);
      delete activeChats[chatId];
    }
  });
}

// Envoyer un message
function sendMessage(chatId, content) {
  // Vérifier si on a rejoint le chat
  if (!activeChats[chatId]) {
    console.log(`Rejoindre d'abord le chat ${chatId}...`);
    joinChat(chatId);
    setTimeout(() => {
      sendMessageToChat(chatId, content);
    }, 1000);
  } else {
    sendMessageToChat(chatId, content);
  }
}

// Envoyer un message à un chat
function sendMessageToChat(chatId, content) {
  const tempId = Date.now().toString();

  socket.emit("send-message", {
    chatId,
    content,
    tempId,
  });

  socket.on("message-sent", (data) => {
    if (data.tempId === tempId) {
      console.log(`Message envoyé avec succès au chat ${chatId}:`, content);

      // Marquer les messages comme lus
      setTimeout(() => {
        markMessagesAsRead(chatId);
      }, 1000);

      // Récupérer les messages du chat
      setTimeout(() => {
        fetchChatMessages(chatId);
      }, 2000);
    }
  });
}

// Marquer les messages comme lus
async function markMessagesAsRead(chatId) {
  try {
    const response = await fetch(`${API_URL}/chats/${chatId}/read`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log(
      `Messages marqués comme lus dans le chat ${chatId}:`,
      data.data.modifiedCount,
    );

    // Récupérer les stats mises à jour
    setTimeout(() => {
      fetchChatStats();
    }, 1000);
  } catch (error) {
    console.error("Erreur lors du marquage des messages comme lus:", error);
  }
}

// Récupérer les messages d'un chat
async function fetchChatMessages(chatId) {
  try {
    const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Messages du chat ${chatId}:`, data.data.length);
  } catch (error) {
    console.error("Erreur lors de la récupération des messages:", error);
  }
}

// Créer un chat direct
async function createDirectChat(userId) {
  try {
    const response = await fetch(`${API_URL}/chats/dm`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workspaceId: WORKSPACE_ID,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log("Chat direct créé:", data.data._id);

    // Rejoindre le nouveau chat
    joinChat(data.data._id);

    // Envoyer un message après un délai
    setTimeout(() => {
      sendMessage(
        data.data._id,
        "Bonjour, ceci est un test de message direct!",
      );
    }, 1000);
  } catch (error) {
    console.error("Erreur lors de la création du chat direct:", error);
  }
}

// Simuler une frappe dans un chat
function simulateTyping(chatId) {
  socket.emit("typing-start", { chatId });

  setTimeout(() => {
    socket.emit("typing-stop", { chatId });
  }, 3000);
}

// Exécuter le script
init();

// Fonctions utilitaires pour le test manuel dans la console
window.testFunctions = {
  sendMessage,
  markMessagesAsRead,
  fetchChatMembers,
  fetchChatStats,
  fetchChatMessages,
  createDirectChat,
  simulateTyping,
  joinChat,
  leaveChat,
};

console.log("Fonctions de test disponibles via window.testFunctions");
