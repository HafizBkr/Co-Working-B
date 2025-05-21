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

export const sendOTPEmail = async (to: string, code: string) => {
  try {
    const result = await transporter.sendMail({
      from: `"Coworking Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Votre code OTP",
      text: `Bonjour,\n\nVoici votre code OTP : ${code}\n\nCe code expire dans 10 minutes.`,
    });
    console.log("Email sent successfully:", result);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (to: string, code: string) => {
  try {
    const result = await transporter.sendMail({
      from: `"Coworking Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Réinitialisation de votre mot de passe",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">Réinitialisation de mot de passe</h2>
          <p>Vous avez demandé à réinitialiser votre mot de passe. Voici votre code de réinitialisation :</p>
          <div style="background-color: #f5f5f5; padding: 10px; text-align: center; border-radius: 3px; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
            <strong>${code}</strong>
          </div>
          <p>Ce code expirera dans 10 minutes.</p>
          <p>Si vous n'avez pas demandé de réinitialisation de mot de passe, veuillez ignorer cet email.</p>
        </div>
      `,
    });
    console.log("Password reset email sent successfully:", result);
    return result;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};
