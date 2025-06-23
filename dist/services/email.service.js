"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const dotenv_1 = __importDefault(require("dotenv"));
const env_1 = require("../config/env");
dotenv_1.default.config();
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
class EmailService {
    async sendOTP(email, code) {
        console.log(`Sending OTP ${code} to email: ${email}`);
        const msg = {
            to: email,
            from: process.env.SENDGRID_FROM_EMAIL,
            subject: "Your One-Time Password (OTP)",
            html: `
      <div>
        <h3>Verification Code</h3>
        <p>Your OTP is: <strong>${code}</strong></p>
        <p>Expires in ${env_1.OTP_EXPIRY_MINUTES} minutes.</p>
      </div>
    `,
        };
        try {
            await mail_1.default.send(msg);
            return true;
        }
        catch (error) {
            console.error("SendGrid Error:", error);
            return false;
        }
    }
}
exports.EmailService = EmailService;
