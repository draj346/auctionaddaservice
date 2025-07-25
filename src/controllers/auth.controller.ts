import { Request, Response } from "express";
import { OTPService } from "../services/otp.service";
import { LoginRequest, OTPSendRequest, OTPVerifyRequest, ResetPasswordRequest } from "../types/auth.types";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import { comparePassword, encryptPassword } from "../utils/encryption";
import { EmailService } from "../services/email.service";
import { SmsService } from "../services/sms.service";
import { ApiResponse } from "../utils/apiResponse";
import { AuthService } from "../services/auth.service";
import { ErrorMessage } from "../constants/constants";
import { RoleService } from "../services/role.service";
import { PlayerRole, ROLES } from "../constants/roles.constants";
import { NotificationService } from "../services/notification.service";
import { NotificationMessage, NOTIFICATIONS, NotificationType } from "../constants/notification.constants";
import { AuctionService } from "../services/auction.service";
import { RoleHelper } from "../helpers/roles.helpers";

const otpService = new OTPService();
const emailService = new EmailService();
const smsService = new SmsService();

export class AuthController {
  static sendOTP = async (req: Request, res: Response) => {
    try {
      const { identifier, method }: OTPSendRequest = req.body;

      if (method === "email" && !identifier.includes("@")) {
        return ApiResponse.error(res, "Invalid email format", 400);
      } else if (method === "otp" && !/^\d{10,}$/.test(identifier)) {
        return ApiResponse.error(res, "Invalid phone number", 400);
      }

      const isValidUser = await AuthService.isValidUser(null, identifier);
      if (!isValidUser) {
        return ApiResponse.error(res, "User is not valid", 401, {
          isNotFound: true,
        });
      }

      const sessionId = await encryptPassword(`session_${identifier}`);
      otpService.invalidateOTP(sessionId);
      const code = otpService.storeOTP(sessionId, identifier);

      let isSuccess;
      if (method === "email") {
        isSuccess = await emailService.sendOTP(identifier, code);
      } else {
        isSuccess = await smsService.sendOTP(identifier, code);
      }

      if (isSuccess) {
        ApiResponse.success(res, { sessionId }, 200, "OTP sent successfully");
      } else {
        ApiResponse.error(res, "SMS Failed");
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.");
    }
  };

  static verifyOTP = async (req: Request, res: Response) => {
    try {
      const { sessionId, code }: OTPVerifyRequest = req.body;

      const identifier = otpService.verifyOTP(sessionId, code);
      if (!!identifier) {
        const isValidUser = await AuthService.isValidUser(null, identifier);
        if (!isValidUser) {
          return ApiResponse.error(res, "User is not valid", 401);
        } else {
          ApiResponse.success(res, {}, 200, "OTP verified successfully");
        }
      } else {
        ApiResponse.error(res, "Invalid OTP or expired", 400);
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.");
    }
  };

  static resetPassword = async (req: Request, res: Response) => {
    try {
      const { sessionId, password }: ResetPasswordRequest = req.body;
      if (!otpService.isOTPVerified(sessionId)) {
        return ApiResponse.error(res, "OTP not verified for this session", 400);
      }

      const identifier = otpService.getIdentifier(sessionId);
      const playerInfo = await AuthService.getPlayerIdByIdentifier(identifier);
      if (!playerInfo) {
        return ApiResponse.error(res, "Player not found", 401);
      }

      const success = await AuthService.updatePassword(playerInfo.playerId, password);

      if (success) {
        otpService.invalidateOTP(sessionId);
        NotificationService.createNotification(
          playerInfo.playerId,
          NotificationMessage.PASSWORD_UPDATED,
          NOTIFICATIONS.PASSWORD_UPDATED as NotificationType,
          playerInfo.playerId,
          ROLES.PLAYER
        );
        ApiResponse.success(res, {}, 200, "Password reset successfully");
      } else {
        ApiResponse.error(res, "Password reset failed", 500);
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.");
    }
  };

  static login = async (req: Request, res: Response) => {
    try {
      const { identifier, method, password, code, sessionId }: LoginRequest = req.body;

      if (!method) {
        return ApiResponse.error(res, "Authentication method required", 400);
      }

      let playerInfo;
      let isValid = false;

      if (method === "otp") {
        if (!sessionId || !code) {
          return ApiResponse.error(res, ErrorMessage.MISSING_PARAMS, 400);
        }

        const indentifierData = otpService.verifyOTP(sessionId, code);
        if (!indentifierData) {
          return ApiResponse.error(res, ErrorMessage.INVALID_CREDENTIALS, 500);
        }

        playerInfo = await AuthService.getPlayerIdByIdentifier(indentifierData);
        if (!playerInfo) {
          return ApiResponse.error(res, ErrorMessage.PLAYER_NOT_FOUND, 401);
        }

        if (sessionId) {
          otpService.invalidateOTP(sessionId);
        }
      } else if (method === "password") {
        if (!identifier || !password) {
          return ApiResponse.error(res, ErrorMessage.MISSING_PARAMS, 400);
        }

        playerInfo = await AuthService.getPlayerIdByIdentifier(identifier);
        if (!playerInfo) {
          return ApiResponse.error(res, ErrorMessage.PLAYER_NOT_FOUND, 401);
        }

        const dbPassword = await AuthService.getPasswordByPlayerId(playerInfo.playerId);
        if (!dbPassword) {
          return ApiResponse.error(res, ErrorMessage.INVALID_CREDENTIALS, 500);
        }

        isValid = await comparePassword(password, dbPassword.password);

        if (!isValid) {
          return ApiResponse.error(res, ErrorMessage.INVALID_CREDENTIALS, 500);
        }
      } else {
        return ApiResponse.error(res, "Unsupported authentication method", 400);
      }

      const image = await AuthService.getPlayerImageByPlayerId(playerInfo.playerId);

      let role = await RoleService.getUserRole(playerInfo.playerId);
      if (RoleHelper.isOrganiser(role as PlayerRole)) {
        const isOrganiser = await AuctionService.isOrganiser(playerInfo.playerId);
        if (!isOrganiser) {
          role = ROLES.PLAYER;
          const roleResult = await RoleService.deleteRole(playerInfo.playerId);
          if (roleResult) {
            NotificationService.createNotification(
              playerInfo.playerId,
              NotificationMessage.REMOVE_ROLE_FROM_ORGANISER,
              NOTIFICATIONS.ROLE_UPDATED as NotificationType,
              playerInfo.playerId,
              ROLES.PLAYER,
            );
          }
        }
      }
      const tokenPayload = {
        playerId: playerInfo.playerId,
        role,
        name: playerInfo.name,
        email: playerInfo.email,
        mobile: playerInfo.mobile,
      };

      const token = jwt.sign(tokenPayload, JWT_SECRET!, {
        expiresIn: "1d",
      });

      const responsePayload = {
        token,
        role: role === ROLES.OWNER ? "R" : role[0],
        image: image || "",
        name: playerInfo.name,
        email: playerInfo.email,
        mobile: playerInfo.mobile,
      };

      ApiResponse.success(res, responsePayload, 200, "Login successful");
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return ApiResponse.error(res, "Token generation failed", 500);
      }

      const errorMessage = error instanceof Error ? error.message : ErrorMessage.AUTH_ERROR;
      ApiResponse.error(res, errorMessage, 500);
    }
  };

  static isJWTTokenValid = async (req: Request, res: Response) => {
    ApiResponse.success(res, {}, 200, "User is Valid");
  };
}
