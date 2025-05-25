import nodemailer from "nodemailer";
import { config } from "../configs/configs";
import { UserRepository } from "../repository/UserRepository";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: config.emailUser,
    pass: config.emailPass,
  },
});


const userRepository = new UserRepository();

export const EmailService = {
  sendInvitationEmail: async (
    toEmail: string,
    workspaceName: string,
    inviterId: string,
    invitationToken: string,
  ) => {
    const inviter = await userRepository.findById(inviterId);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    const invitationLink = `${frontendUrl}/invite?token=${invitationToken}`;

    const mailOptions = {
      from: `"Co-Workink" <${config.emailUser}>`,
      to: toEmail,
      subject: `Invitation to join ${workspaceName} workspace`,
      html: `
        <h1>You've been invited to join ${workspaceName}</h1>
        <p>${inviter?.username} (${inviter?.email}) has invited you to collaborate on the "${workspaceName}" workspace.</p>
        <p>Click the button below to accept the invitation:</p>
        <a href="${invitationLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Accept Invitation</a>
        <p>If you didn't request this invitation, you can safely ignore this email.</p>
        <p>This invitation link will expire in 7 days.</p>
      `,
    };

    return transporter.sendMail(mailOptions);
  },
};

export default EmailService;
