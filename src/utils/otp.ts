import crypto from "crypto";
import Otp from "../models/otp";
import { sendOTPEmail } from "./email";

/**
 * Génère un OTP à 6 chiffres
 */

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Crée un OTP en base de données et l'envoie par email
 */
export const createAndSendOTP = async (email: string): Promise<void> => {
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  const createdAt = new Date();

  await Otp.deleteMany({ email });
  await Otp.create({ email, code, createdAt, expiresAt });
  await sendOTPEmail(email, code);
};

/**
 * Vérifie le code OTP envoyé par l'utilisateur
 */
export const verifyOTP = async (
  email: string,
  inputCode: string,
): Promise<boolean> => {
  const otpEntry = await Otp.findOne({ email }).sort({ createdAt: -1 });

  if (!otpEntry) throw new Error("OTP introuvable");

  if (otpEntry.createdAt < new Date()) throw new Error("OTP expiré");

  if (otpEntry.code !== inputCode) throw new Error("OTP incorrect");

  await Otp.deleteMany({ email });

  return true;
};
