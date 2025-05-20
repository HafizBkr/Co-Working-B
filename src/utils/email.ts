import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (to: string, code: string) => {
  await transporter.sendMail({
    from: `"Coworking Platform" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Votre code OTP",
    text: `Bonjour,\n\nVoici votre code OTP : ${code}\n\nCe code expire dans 10 minutes.`,
  });
};
