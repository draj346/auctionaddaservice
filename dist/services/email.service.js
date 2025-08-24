"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const sendMail_1 = require("../utils/sendMail");
dotenv_1.default.config();
class EmailService {
    async sendOTP(email, code, name) {
        console.log(`Sending OTP ${code} to email: ${email}`);
        try {
            await (0, sendMail_1.sendOtpEmail)({ name, to: email, otp: code });
            return true;
        }
        catch (error) {
            console.error("SendGrid Error:", error);
            return false;
        }
    }
}
exports.EmailService = EmailService;
