"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const apiResponse_1 = require("../utils/apiResponse");
const auth_service_1 = require("../services/auth.service");
const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
        return apiResponse_1.ApiResponse.error(res, "Unauthorized: No token provided", 401);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.JWT_SECRET);
        const userInfo = await auth_service_1.AuthService.isValidLoggedInUser(decoded.playerId);
        if (!userInfo) {
            return apiResponse_1.ApiResponse.error(res, "User not found", 401);
        }
        req.userId = decoded.playerId;
        req.role = decoded.role;
        next();
    }
    catch (err) {
        return apiResponse_1.ApiResponse.error(res, "Unauthorized: Invalid token", 401);
    }
};
exports.authMiddleware = authMiddleware;
