const io = require("socket.io-client");
const fetch = require("node-fetch");

// Configuration
const API_URL = "http://localhost:5000/api/v1";
const SOCKET_URL = "http://localhost:5000";
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODc2MjgwZDcwMTM1M2Q3OWFlYzM0ZGEiLCJlbWFpbCI6ImhhZml6aW5vdnVzQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJpYXQiOjE3NTI1ODA0MTYsImV4cCI6MTc1Mjc1MzIxNn0.v3rPLK6jsxH8REzum9b61Pd_r2P550qsDVgHx0PnH3U";
const WORKSPACE_ID = "687629c0701353d79aec3509";

let socket;
let chatMembers = [];
let generalChat = null;
let activeChats = {};

async function fetchCurrentUser() {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
  const data = await response.json();
  console.log("Utilisateur connecté:", data.data.username);
  return data.data._id;
}

async function fetchChatMembers() {
  const response = await fetch(
    `${API_URL}/chat-members/workspace/${WORKSPACE_ID}/members`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
  const data = await response.json();
  chatMembers = data.data.members;
  generalChat = data.data.generalChat;
  console.log("=== MEMBRES DE CHAT ===");
  chatMembers.forEach((member) => {
    console.log(
      `- ${member.user.username} ${member.online ? "(en ligne)" : "(hors ligne)"}`
    );
    if (member.lastMessage) {
      console.log(
        `  Dernier message: ${member.lastMessage.content.substring(0, 30)}...`
      );
      console.log(`  Non lus: ${member.unreadCount}`);
    }
  });
  console.log("=== CHAT GÉNÉRAL ===");
  console.log(
    `- ${generalChat.name} (${generalChat.participants} participants)`
  );
  if (generalChat.lastMessage) {
    console.log(
      `  Dernier message: ${generalChat.lastMessage.content.substring(0, 30)}...`
    );
    console.log(`  Non lus: ${generalChat.unreadCount}`);
  }
}

function connectSocket() {
  socket = io(SOCKET_URL, {
    auth: { token: TOKEN },
  });

  socket.on("connect", () => {
    console.log("Socket connecté!");
    joinWorkspace();
  });

  socket.on("error", (error) => {
    console.error("Erreur socket:", error);
  });

  socket.on("new-message", (data) => {
    console.log(`Nouveau message reçu dans le chat ${data.chat}:`, data.content);
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
      `Utilisateur ${data.userId} est en train d'écrire dans le chat ${data.chatId}`
    );
  });

  socket.on("user-stopped-typing", (data) => {
    console.log(
      `Utilisateur ${data.userId} a arrêté d'écrire dans le chat ${data.chatId}`
    );
  });

  socket.on("messages-read", (data) => {
    console.log(`Messages lus par ${data.userId} dans le chat ${data.chatId}`);
  });
}

function joinWorkspace() {
  socket.emit("join-workspace", WORKSPACE_ID);

  socket.on("workspace-joined", (data) => {
    console.log(`Workspace rejoint: ${data.workspaceId}`);
    if (generalChat) joinChat(generalChat._id);
    chatMembers.forEach((member) => {
      if (member.chatId) joinChat(member.chatId);
    });
    // Envoi de messages de test
    setTimeout(() => {
      if (generalChat) {
        console.log("Envoi d'un message au chat général...");
        sendMessage(generalChat._id, "Bonjour à tous ! Test du chat en temps réel.");
      }
      if (chatMembers.length > 0 && chatMembers[0].chatId) {
        setTimeout(() => {
          console.log(
            `Envoi d'un message direct à ${chatMembers[0].user.username}...`
          );
          sendMessage(
            chatMembers[0].chatId,
            `Bonjour ${chatMembers[0].user.username} ! Test du message direct.`
          );
        }, 2000);
      }
    }, 2000);
  });

  socket.on("active-users", (users) => {
    console.log("Utilisateurs actifs:", users.length);
  });
}

function joinChat(chatId) {
  socket.emit("join-chat", chatId);
  socket.on("chat-joined", (data) => {
    if (data.chatId === chatId) {
      console.log(`Chat rejoint: ${chatId}`);
      activeChats[chatId] = true;
    }
  });
}

function sendMessage(chatId, content) {
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

function sendMessageToChat(chatId, content) {
  const tempId = Date.now().toString();
  socket.emit("send-message", { chatId, content, tempId });
  socket.on("message-sent", (data) => {
    if (data.tempId === tempId) {
      console.log(`Message envoyé avec succès au chat ${chatId}:`, content);
    }
  });
}

// MAIN
(async () => {
  try {
    await fetchCurrentUser();
    await fetchChatMembers();
    connectSocket();
  } catch (error) {
    console.error("Erreur lors de l'initialisation:", error);
  }
})();
