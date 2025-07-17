import { Request, Response } from "express";
import { UserRepository } from "../repository/User.repository";
import { createAndSendOTP, verifyOTP } from "../utils/otp";
import { generateToken } from "../utils/jwt";
import { WorkspaceInvitationService } from "../services/workspace-invitation.service";
import {
  createAndSendPasswordResetCode,
  verifyPasswordResetCode,
} from "../utils/passwordReset";
import { hashPassword } from "../utils/hash";
import PasswordReset from "../models/passwordReset";
import {
  ERROR_MESSAGES,
  HTTP_RESPONSES,
  RESPONSE_CODES,
  SUCCESS_MESSAGES,
} from "../utils/error_response";

const userRepository = new UserRepository();

export const AuthController = {
  async register(req: Request, res: Response) {
    try {
      const { email, password, username, avatar, bio, location } = req.body;

      if (!email || !password || !username) {
        return res.status(RESPONSE_CODES.BAD_REQUEST).json({
          ...HTTP_RESPONSES.FAILURE,
          message: ERROR_MESSAGES.INVALID_AUTH_PAYLOAD,
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
      if (!user) {
        return res.status(RESPONSE_CODES.CONFLICT).json({
          ...HTTP_RESPONSES.FAILURE,
          message: ERROR_MESSAGES.EMAIL_ALREADY_USED,
        });
      }

      return res.status(RESPONSE_CODES.CREATED).json({
        ...HTTP_RESPONSES.SUCCESS,
        message: SUCCESS_MESSAGES.USER_CREATED,
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
      return res.status(RESPONSE_CODES.SERVER_ERROR).json({
        ...HTTP_RESPONSES.FAILURE,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  },

  async verifyEmail(req: Request, res: Response) {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(RESPONSE_CODES.BAD_REQUEST).json({
          ...HTTP_RESPONSES.FAILURE,
          message: ERROR_MESSAGES.INVALID_PAYLOAD,
        });
      }

      try {
        await verifyOTP(email, code);

        const user = await userRepository.findOne({ email });
        if (!user) {
          return res.status(RESPONSE_CODES.NOT_FOUND).json({
            ...HTTP_RESPONSES.FAILURE,
            message: ERROR_MESSAGES.USER_NOT_FOUND,
          });
        }
        user.emailVerified = true;
        await user.save();

        let invitationActivated = false;
        try {
          await WorkspaceInvitationService.activateInvitationForUser(email);
          invitationActivated = true;
        } catch (e) {}

        return res.status(RESPONSE_CODES.OK).json({
          ...HTTP_RESPONSES.SUCCESS,
          message: invitationActivated
            ? SUCCESS_MESSAGES.EMAIL_VERIFIED +
              " " +
              SUCCESS_MESSAGES.INVITATION_ACCEPTED
            : SUCCESS_MESSAGES.EMAIL_VERIFIED,
        });
      } catch (otpError) {
        return res.status(RESPONSE_CODES.BAD_REQUEST).json({
          ...HTTP_RESPONSES.FAILURE,
          message: ERROR_MESSAGES.INVALID_VERIFICATION_CODE,
        });
      }
    } catch (error) {
      console.error("Email verification error:", error);
      return res.status(RESPONSE_CODES.SERVER_ERROR).json({
        ...HTTP_RESPONSES.FAILURE,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  },

  async resendOTP(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(RESPONSE_CODES.BAD_REQUEST).json({
          ...HTTP_RESPONSES.FAILURE,
          message: ERROR_MESSAGES.EMAIL_REQUIRED,
        });
      }

      const user = await userRepository.findOne({ email });
      if (!user) {
        return res.status(RESPONSE_CODES.NOT_FOUND).json({
          ...HTTP_RESPONSES.FAILURE,
          message: ERROR_MESSAGES.USER_NOT_FOUND,
        });
      }

      await createAndSendOTP(email);

      return res.status(RESPONSE_CODES.OK).json({
        ...HTTP_RESPONSES.SUCCESS,
        message: SUCCESS_MESSAGES.OTP_SENT,
      });
    } catch (error) {
      console.error("Resend OTP error:", error);
      return res.status(RESPONSE_CODES.SERVER_ERROR).json({
        ...HTTP_RESPONSES.FAILURE,
        message: ERROR_MESSAGES.OTP_SEND_FAILED,
      });
    }
  },

  async loginUser(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(RESPONSE_CODES.BAD_REQUEST).json({
          ...HTTP_RESPONSES.FAILURE,
          message: ERROR_MESSAGES.INVALID_PAYLOAD,
        });
      }

      const user = await userRepository.login(email, password);

      if (!user) {
        return res.status(RESPONSE_CODES.UNAUTHORIZED).json({
          ...HTTP_RESPONSES.FAILURE,
          message: ERROR_MESSAGES.INVALID_EMAIL_OR_PASSWORD,
        });
      }

      if (!user.emailVerified) {
        await createAndSendOTP(user.email);

        return res.status(RESPONSE_CODES.FORBIDDEN).json({
          ...HTTP_RESPONSES.FAILURE,
          message: ERROR_MESSAGES.EMAIL_NOT_VERIFIED,
          needsVerification: true,
          email: user.email,
        });
      }

      const token = generateToken(user);

      return res.status(RESPONSE_CODES.OK).json({
        ...HTTP_RESPONSES.SUCCESS,
        message: SUCCESS_MESSAGES.USER_LOGGED_IN,
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
      return res.status(RESPONSE_CODES.SERVER_ERROR).json({
        ...HTTP_RESPONSES.FAILURE,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  },

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(RESPONSE_CODES.BAD_REQUEST).json({
          ...HTTP_RESPONSES.FAILURE,
          message: ERROR_MESSAGES.EMAIL_REQUIRED,
        });
      }

      const user = await userRepository.findOne({ email });
      if (!user) {
        return res.status(RESPONSE_CODES.OK).json({
          ...HTTP_RESPONSES.SUCCESS,
          message: SUCCESS_MESSAGES.PASSWORD_RESET_CODE_SENT,
        });
      }

      await createAndSendPasswordResetCode(email);

      return res.status(RESPONSE_CODES.OK).json({
        ...HTTP_RESPONSES.SUCCESS,
        message: SUCCESS_MESSAGES.PASSWORD_RESET_CODE_SENT,
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      return res.status(RESPONSE_CODES.SERVER_ERROR).json({
        ...HTTP_RESPONSES.FAILURE,
        message: ERROR_MESSAGES.PASSWORD_RESET_FAILED,
      });
    }
  },

  async verifyResetCode(req: Request, res: Response) {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(RESPONSE_CODES.BAD_REQUEST).json({
          ...HTTP_RESPONSES.FAILURE,
          message: ERROR_MESSAGES.INVALID_PAYLOAD,
        });
      }

      try {
        await verifyPasswordResetCode(email, code);
        return res.status(RESPONSE_CODES.OK).json({
          ...HTTP_RESPONSES.SUCCESS,
          message: SUCCESS_MESSAGES.RESET_CODE_VERIFIED,
        });
      } catch (error) {
        return res.status(RESPONSE_CODES.BAD_REQUEST).json({
          ...HTTP_RESPONSES.FAILURE,
          message: ERROR_MESSAGES.INVALID_RESET_CODE,
        });
      }
    } catch (error) {
      console.error("Verify reset code error:", error);
      return res.status(RESPONSE_CODES.SERVER_ERROR).json({
        ...HTTP_RESPONSES.FAILURE,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const { email, code, newPassword } = req.body;

      if (!email || !code || !newPassword) {
        return res.status(RESPONSE_CODES.BAD_REQUEST).json({
          ...HTTP_RESPONSES.FAILURE,
          message: ERROR_MESSAGES.INVALID_PAYLOAD,
        });
      }

      try {
        await verifyPasswordResetCode(email, code);
      } catch (error) {
        return res.status(RESPONSE_CODES.BAD_REQUEST).json({
          ...HTTP_RESPONSES.FAILURE,
          message: ERROR_MESSAGES.INVALID_RESET_CODE,
        });
      }

      const hashedPassword = await hashPassword(newPassword);
      const user = await userRepository.updateOne(
        { email },
        { password: hashedPassword },
      );

      if (!user) {
        return res.status(RESPONSE_CODES.NOT_FOUND).json({
          ...HTTP_RESPONSES.FAILURE,
          message: ERROR_MESSAGES.USER_NOT_FOUND,
        });
      }

      await PasswordReset.deleteMany({ email });

      return res.status(RESPONSE_CODES.OK).json({
        ...HTTP_RESPONSES.SUCCESS,
        message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS,
      });
    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(RESPONSE_CODES.SERVER_ERROR).json({
        ...HTTP_RESPONSES.FAILURE,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  },
};
