import PasswordReset from "../models/passwordReset";
import { sendPasswordResetEmail } from "./email";
import { generateOTP } from "./otp";

export const createAndSendPasswordResetCode = async (
  email: string,
): Promise<void> => {
  const code = generateOTP(); // Réutilisation de la fonction de génération d'OTP
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  const createdAt = new Date();

  await PasswordReset.deleteMany({ email });

  await PasswordReset.create({ email, code, createdAt, expiresAt });

  await sendPasswordResetEmail(email, code);
};

export const verifyPasswordResetCode = async (
  email: string,
  inputCode: string,
): Promise<boolean> => {
  const resetEntry = await PasswordReset.findOne({ email }).sort({
    createdAt: -1,
  });

  if (!resetEntry) throw new Error("Code de réinitialisation introuvable");
  if (new Date() > resetEntry.expiresAt)
    throw new Error("Code de réinitialisation expiré");
  if (resetEntry.code !== inputCode)
    throw new Error("Code de réinitialisation incorrect");
  return true;
};
