"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTP_EXPIRY_MINUTES = exports.FILE_UPLOAD_FOLDER = exports.FILE_UPLOAD_LOCATION = exports.JWT_SECRET = exports.DB_PORT = exports.DB_NAME = exports.DB_PASSWORD = exports.DB_USER = exports.DB_HOST = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
exports.DB_HOST = process.env.DB_HOST;
exports.DB_USER = process.env.DB_USER;
exports.DB_PASSWORD = process.env.DB_PASSWORD;
exports.DB_NAME = process.env.DB_NAME;
exports.DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.FILE_UPLOAD_LOCATION = process.env.FILE_UPLOAD_LOCATION;
exports.FILE_UPLOAD_FOLDER = process.env.FILE_UPLOAD_FOLDER;
exports.OTP_EXPIRY_MINUTES = process.env.OTP_EXPIRY_MINUTES
    ? parseInt(process.env.OTP_EXPIRY_MINUTES)
    : 2;
