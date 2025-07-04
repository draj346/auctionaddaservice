"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const otp_service_1 = require("../services/otp.service");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const encryption_1 = require("../utils/encryption");
const email_service_1 = require("../services/email.service");
const sms_service_1 = require("../services/sms.service");
const apiResponse_1 = require("../utils/apiResponse");
const auth_service_1 = require("../services/auth.service");
const constants_1 = require("../constants/constants");
const role_service_1 = require("../services/role.service");
const roles_constants_1 = require("../constants/roles.constants");
const otpService = new otp_service_1.OTPService();
const emailService = new email_service_1.EmailService();
const smsService = new sms_service_1.SmsService();
class AuthController {
}
exports.AuthController = AuthController;
_a = AuthController;
AuthController.sendOTP = async (req, res) => {
    try {
        const { identifier, method } = req.body;
        if (method === "email" && !identifier.includes("@")) {
            return apiResponse_1.ApiResponse.error(res, "Invalid email format", 400);
        }
        else if (method === "otp" && !/^\d{10,}$/.test(identifier)) {
            return apiResponse_1.ApiResponse.error(res, "Invalid phone number", 400);
        }
        const isValidUser = await auth_service_1.AuthService.isValidUser(null, identifier);
        if (!isValidUser) {
            return apiResponse_1.ApiResponse.error(res, "User is not valid", 401);
        }
        const sessionId = await (0, encryption_1.encryptPassword)(`session_${identifier}`);
        otpService.invalidateOTP(sessionId);
        const code = otpService.storeOTP(sessionId, identifier);
        let isSuccess;
        if (method === "email") {
            isSuccess = await emailService.sendOTP(identifier, code);
        }
        else {
            isSuccess = await smsService.sendOTP(identifier, code);
        }
        if (isSuccess) {
            apiResponse_1.ApiResponse.success(res, { sessionId }, 200, "OTP sent successfully");
        }
        else {
            apiResponse_1.ApiResponse.error(res, "SMS Failed");
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.");
    }
};
AuthController.verifyOTP = async (req, res) => {
    try {
        const { sessionId, code } = req.body;
        const identifier = otpService.verifyOTP(sessionId, code);
        if (!!identifier) {
            const isValidUser = await auth_service_1.AuthService.isValidUser(null, identifier);
            if (!isValidUser) {
                return apiResponse_1.ApiResponse.error(res, "User is not valid", 401);
            }
            else {
                apiResponse_1.ApiResponse.success(res, {}, 200, "OTP verified successfully");
            }
        }
        else {
            apiResponse_1.ApiResponse.error(res, "Invalid OTP or expired", 400);
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.");
    }
};
AuthController.resetPassword = async (req, res) => {
    try {
        const { sessionId, password } = req.body;
        if (!otpService.isOTPVerified(sessionId)) {
            return apiResponse_1.ApiResponse.error(res, "OTP not verified for this session", 400);
        }
        const identifier = otpService.getIdentifier(sessionId);
        const player = await auth_service_1.AuthService.verifyPlayerByIdentifier(identifier, true);
        if (!player) {
            return apiResponse_1.ApiResponse.error(res, "Player not found", 401);
        }
        const success = await auth_service_1.AuthService.updatePassword(player.playerId, password);
        if (success) {
            otpService.invalidateOTP(sessionId);
            apiResponse_1.ApiResponse.success(res, {}, 200, "Password reset successfully");
        }
        else {
            apiResponse_1.ApiResponse.error(res, "Password reset failed", 500);
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.");
    }
};
AuthController.login = async (req, res) => {
    try {
        const { identifier, method, password, code, sessionId } = req.body;
        if (!method) {
            return apiResponse_1.ApiResponse.error(res, "Authentication method required", 400);
        }
        let player;
        let isValid = false;
        if (method === "otp") {
            if (!sessionId || !code) {
                return apiResponse_1.ApiResponse.error(res, constants_1.ErrorMessage.MISSING_PARAMS, 400);
            }
            const playerId = otpService.verifyOTP(sessionId, code);
            if (!playerId) {
                return apiResponse_1.ApiResponse.error(res, constants_1.ErrorMessage.INVALID_CREDENTIALS, 500);
            }
            player = await auth_service_1.AuthService.verifyPlayerByIdentifier(playerId, true);
        }
        else if (method === "password") {
            if (!identifier || !password) {
                return apiResponse_1.ApiResponse.error(res, constants_1.ErrorMessage.MISSING_PARAMS, 400);
            }
            player = await auth_service_1.AuthService.verifyPlayerByIdentifier(identifier, true);
            if (player) {
                isValid = await (0, encryption_1.comparePassword)(password, player.password);
            }
        }
        else {
            return apiResponse_1.ApiResponse.error(res, "Unsupported authentication method", 400);
        }
        if (!player) {
            return apiResponse_1.ApiResponse.error(res, constants_1.ErrorMessage.PLAYER_NOT_FOUND, 401);
        }
        if (method === "password" && !isValid) {
            return apiResponse_1.ApiResponse.error(res, constants_1.ErrorMessage.INVALID_CREDENTIALS, 500);
        }
        if (sessionId) {
            otpService.invalidateOTP(sessionId);
        }
        const role = await role_service_1.RoleService.getUserRole(player.playerId);
        const tokenPayload = { playerId: player.playerId, role };
        const token = jsonwebtoken_1.default.sign(tokenPayload, env_1.JWT_SECRET, {
            expiresIn: "1d",
        });
        const responsePayload = {
            token,
            role: role === roles_constants_1.ROLES.OWNER ? 'R' : role[0],
            image: player.image || ''
        };
        apiResponse_1.ApiResponse.success(res, responsePayload, 200, "Login successful");
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return apiResponse_1.ApiResponse.error(res, "Token generation failed", 500);
        }
        const errorMessage = error instanceof Error ? error.message : constants_1.ErrorMessage.AUTH_ERROR;
        apiResponse_1.ApiResponse.error(res, errorMessage, 500);
    }
};
AuthController.isJWTTokenValid = async (req, res) => {
    apiResponse_1.ApiResponse.success(res, {}, 200, "User is Valid");
};
