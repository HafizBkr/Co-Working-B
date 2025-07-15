import nodemailer from "nodemailer";
import { config } from "../configs/configs";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: config.emailUser,
    pass: config.emailPass,
  },
});

export const sendTaskAssignmentEmail = async ({
  to,
  task,
  assignedBy,
}: {
  to: string;
  task: any;
  assignedBy: { username: string; email: string };
}) => {
  // Correction : récupération des noms ou fallback sur "Inconnu"
  const projectName =
    typeof task.project === "object" && task.project?.name
      ? task.project.name
      : "Inconnu";
  const workspaceName =
    typeof task.workspace === "object" && task.workspace?.name
      ? task.workspace.name
      : "Inconnu";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Nouvelle tâche assignée</h2>
      <p>Bonjour <strong>${task.assignedTo?.username || ""}</strong>,</p>
      <p>Une nouvelle tâche vient de vous être assignée par <strong>${assignedBy.username}</strong> (${assignedBy.email}) :</p>
      <ul>
        <li><strong>Titre :</strong> ${task.title}</li>
        <li><strong>Description :</strong> ${task.description || "Aucune"}</li>
        <li><strong>Projet :</strong> ${projectName}</li>
        <li><strong>Workspace :</strong> ${workspaceName}</li>
        <li><strong>Priorité :</strong> ${task.priority}</li>
        <li><strong>Statut :</strong> ${task.status}</li>
        <li><strong>Date limite :</strong> ${task.dueDate ? new Date(task.dueDate).toLocaleString() : "Non définie"}</li>
      </ul>
      <p>Merci de vous connecter à la plateforme pour plus de détails.</p>
    </div>
  `;

  return transporter.sendMail({
    from: `"Co-Workink" <${config.emailUser}>`,
    to,
    subject: "Nouvelle tâche assignée",
    html,
  });
};
