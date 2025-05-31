import { Router } from "express";
import type { RequestHandler } from "express";
import { AuthController } from "../controllers/auth";

const router = Router();

const registerHandler: RequestHandler = async (req, res, next) => {
  await AuthController.register(req, res);
};

const verifyEmailHandler: RequestHandler = async (req, res, next) => {
  await AuthController.verifyEmail(req, res);
};

const resendOTPHandler: RequestHandler = async (req, res, next) => {
  await AuthController.resendOTP(req, res);
};

const loginHandler: RequestHandler = async (req, res, next) => {
  await AuthController.loginUser(req, res);
};
const forgotPasswordHandler: RequestHandler = async (req, res, next) => {
  await AuthController.forgotPassword(req, res);
};

const verifyResetCodeHandler: RequestHandler = async (req, res, next) => {
  await AuthController.verifyResetCode(req, res);
};

const resetPasswordHandler: RequestHandler = async (req, res, next) => {
  await AuthController.resetPassword(req, res);
};

router.post("/register", registerHandler);
router.post("/verify-email", verifyEmailHandler);
router.post("/resend-otp", resendOTPHandler);
router.post("/login", loginHandler);
router.post("/forgot-password", forgotPasswordHandler);
router.post("/verify-reset-code", verifyResetCodeHandler);
router.post("/reset-password", resetPasswordHandler);

export default router;
