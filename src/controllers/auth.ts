import { Request, Response } from "express";
import { UserRepository } from "../repository/UserRepository";
import { createAndSendOTP, verifyOTP } from "../utils/otp";
import { generateToken } from "../utils/jwt";
import {
  createAndSendPasswordResetCode,
  verifyPasswordResetCode,
} from "../utils/passwordReset";
import { hashPassword } from "../utils/hash";
import PasswordReset from "../models/passwordReset";
const userRepository = new UserRepository();

export const AuthController = {
  async register(req: Request, res: Response) {
    try {
      const { email, password, username, avatar, bio, location } = req.body;

      if (!email || !password || !username) {
        return res.status(400).json({
          success: false,
          message: "Email, password and username are required",
        });
      }

      const user = await userRepository.register({
        email,
        password,
        username,
        avatar,
        bio,
        location,
      });

      // Check if user was created successfully
      if (!user) {
        return res.status(409).json({
          success: false,
          message: "User with this email already exists",
        });
      }

      return res.status(201).json({
        success: true,
        message:
          "User registered successfully. Please check your email for verification code.",
        data: {
          id: user._id,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
          bio: user.bio,
          location: user.location,
          createdAt: user.createdAt,
          emailVerified: user.emailVerified,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred during registration",
      });
    }
  },

  async verifyEmail(req: Request, res: Response) {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({
          success: false,
          message: "Email and verification code are required",
        });
      }

      try {
        await verifyOTP(email, code);

        const user = await userRepository.updateOne(
          { email },
          { emailVerified: true },
        );

        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        return res.status(200).json({
          success: true,
          message: "Email verified successfully",
        });
      } catch (otpError) {
        return res.status(400).json({
          success: false,
          message: "Invalid verification code",
        });
      }
    } catch (error) {
      console.error("Email verification error:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred during email verification",
      });
    }
  },

  async resendOTP(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const user = await userRepository.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      await createAndSendOTP(email);

      return res.status(200).json({
        success: true,
        message: "New verification code sent to your email",
      });
    } catch (error) {
      console.error("Resend OTP error:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while sending the verification code",
      });
    }
  },

  async loginUser(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }

      const user = await userRepository.login(email, password);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Vérifier si l'email est vérifié
      if (!user.emailVerified) {
        // Renvoyer un code OTP
        await createAndSendOTP(user.email);

        return res.status(403).json({
          success: false,
          message: "Email not verified. A new verification code has been sent.",
          needsVerification: true,
          email: user.email,
        });
      }

      // Générer le token JWT
      const token = generateToken(user);

      return res.status(200).json({
        success: true,
        message: "Logged in successfully",
        data: {
          user: {
            id: user._id,
            email: user.email,
            username: user.username,
            avatar: user.avatar,
            bio: user.bio,
            location: user.location,
          },
          token,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred during login",
      });
    }
  },

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const user = await userRepository.findOne({ email });
      if (!user) {
        // Par sécurité, ne pas indiquer que l'utilisateur n'existe pas
        return res.status(200).json({
          success: true,
          message:
            "If this email is registered, a password reset code has been sent",
        });
      }

      await createAndSendPasswordResetCode(email);

      return res.status(200).json({
        success: true,
        message: "Password reset code sent to your email",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while processing your request",
      });
    }
  },

  async verifyResetCode(req: Request, res: Response) {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({
          success: false,
          message: "Email and reset code are required",
        });
      }

      try {
        await verifyPasswordResetCode(email, code);
        return res.status(200).json({
          success: true,
          message: "Reset code verified successfully",
        });
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid reset code",
        });
      }
    } catch (error) {
      console.error("Verify reset code error:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while verifying the reset code",
      });
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const { email, code, newPassword } = req.body;

      if (!email || !code || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Email, reset code and new password are required",
        });
      }

      try {
        await verifyPasswordResetCode(email, code);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid reset code",
        });
      }

      const hashedPassword = await hashPassword(newPassword);
      const user = await userRepository.updateOne(
        { email },
        { password: hashedPassword },
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      await PasswordReset.deleteMany({ email });

      return res.status(200).json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while resetting your password",
      });
    }
  },
};
