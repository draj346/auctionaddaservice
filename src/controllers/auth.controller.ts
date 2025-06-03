import { Request, Response } from "express";
import { OTPService } from "../services/otp.service";
import { PlayerService } from "../services/player.service";
import {
  LoginRequest,
  OTPSendRequest,
  OTPVerifyRequest,
  ResetPasswordRequest,
} from "../types/auth.types";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import { comparePassword } from "../utils/encryption";
import { EmailService } from "../services/email.service";
import { SmsService } from "../services/sms.service";
import { ApiResponse } from "../utils/apiResponse";
import { AuthService } from "../services/auth.service";

const otpService = new OTPService();
const emailService = new EmailService();
const smsService = new SmsService();
const playerService = new PlayerService();

export class AuthController {
  static sendOTP = async (req: Request, res: Response) => {
    try {
      const { identifier, method }: OTPSendRequest = req.body;

      // Validate identifier format based on method
      if (method === "email" && !identifier.includes("@")) {
        return ApiResponse.error(res, "Invalid email format", 400);
      } else if (method === "sms" && !/^\d{10,}$/.test(identifier)) {
        return ApiResponse.error(res, "Invalid phone number", 400);
      }

      const isValidUser = await AuthService.isValidUser(null, identifier);
      if (!isValidUser) {
        return ApiResponse.error(res, "User is not valid", 401);
      }

      const sessionId = `session_${Date.now()}_${identifier}`;
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
      ApiResponse.error(
        res,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  static verifyOTP = async (req: Request, res: Response) => {
    try {
      const { uniqueIdentifier, code }: OTPVerifyRequest = req.body;

      const identifier = otpService.verifyOTP(uniqueIdentifier, code);
      if (!!identifier) {
        const isValidUser = await AuthService.isValidUser(null, identifier);
        if (!isValidUser) {
          return ApiResponse.error(res, "User is not valid", 401);
        } else {
          ApiResponse.success(res, null, 200, "OTP verified successfully");
        }
      } else {
        ApiResponse.error(res, "Invalid OTP or expired", 400);
      }
    } catch (error) {
      ApiResponse.error(
        res,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  static resetPassword = async (req: Request, res: Response) => {
    try {
      const {
        identifier,
        newPassword,
        uniqueIdentifier,
      }: ResetPasswordRequest = req.body;

      if (!otpService.isOTPVerified(uniqueIdentifier)) {
        return ApiResponse.error(res, "OTP not verified for this session", 400);
      }

      const isValidUser = await AuthService.isValidUser(null, identifier);
      if (!isValidUser) {
        return ApiResponse.error(res, "User is not valid", 401);
      }

      // Find player by identifier (email or phone)
      const player = await playerService.findPlayerByIdentifier(identifier);
      if (!player) {
        return ApiResponse.error(res, "Player not found", 401);
      }

      const success = await playerService.updatePassword(
        player.playerId,
        newPassword
      );

      if (success) {
        otpService.invalidateOTP(uniqueIdentifier);
        ApiResponse.success(res, null, 200, "Password reset successfully");
      } else {
        ApiResponse.error(res, "Password reset failed", 500);
      }
    } catch (error) {
      ApiResponse.error(
        res,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  static login = async (req: Request, res: Response) => {
    try {
      const { identifier, method, password, otp, uniqueIdentifier }: LoginRequest = req.body;
      const player = await playerService.findPlayerByIdentifier(identifier);

      if (!player) {
        return ApiResponse.error(res, "Player is not available", 401);
      }

      let isValid = false;

      if (method === "password" && password && player.password) {
        isValid = await comparePassword(password, player.password);
      } else if (method === "otp" && otp) {
        const id = otpService.verifyOTP(uniqueIdentifier, otp);
        isValid = identifier === id;
      }

      if (!isValid) {
        return ApiResponse.error(res, "Invalid credentials", 401);
      }

      // Generate JWT token
      const token = jwt.sign({ playerId: player.playerId }, JWT_SECRET, {
        expiresIn: "1d",
      });

      ApiResponse.success(res, { token }, 200, "Login successful");
    } catch (error) {
      ApiResponse.error(
        res,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };
}
