import jwt from "jsonwebtoken";
import { io } from "socket.io-client";

// === CONFIGURATION ===
const SERVER_URL = "http://localhost:5000";
const JWT_SECRET = "KUGVVUIWYGV;K,GGKJKJVKJX"; // ton config.jwtSecret

const USERS = [
  {
    id: "6863d7559b432d878f99c44f", // <-- remplace par un vrai ID
    name: "Alice",
  },
  {
    id: "6863d5e99b432d878f99c41f", // <-- remplace par un autre ID
    name: "Bob",
  },
];

const WORKSPACE_ID = "6863d6b29b432d878f99c436"; // <-- remplace
const CHAT_ID = "6863d6b29b432d878f99c43a"; // <-- remplace

// === Génération des JWT et connexions Socket ===
function connectUser(user) {
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: "1h",
  });

  const socket = io(SERVER_URL, {
    auth: { token },
  });

  socket.on("connect", () => {
    console.log(`✅ [${user.name}] connecté : ${socket.id}`);

    socket.emit("join-workspace", WORKSPACE_ID);
    socket.emit("join-chat", CHAT_ID);

    if (user.name === "Alice") {
      // Alice envoie un message après 2s
      setTimeout(() => {
        socket.emit("send-message", {
          chatId: CHAT_ID,
          content: "Bonjour Bob ! 👋",
          tempId: "temp-msg-1",
        });
      }, 2000);
    }
  });

  socket.on("new-message", (data) => {
    console.log(`💬 [${user.name}] a reçu un message :`, data.content);
  });

  socket.on("message-sent", (data) => {
    console.log(`📤 [${user.name}] message envoyé :`, data);
  });

  socket.on("chat-joined", (data) => {
    console.log(`📥 [${user.name}] a rejoint le chat :`, data.chatId);
  });

  socket.on("workspace-joined", (data) => {
    console.log(`📥 [${user.name}] a rejoint le workspace :`, data.workspaceId);
  });

  socket.on("error", (err) => {
    console.error(`❌ [${user.name}] erreur :`, err);
  });

  socket.on("disconnect", () => {
    console.log(`🔌 [${user.name}] déconnecté`);
  });
}

// === Lancement des 2 utilisateurs ===
USERS.forEach(connectUser);
