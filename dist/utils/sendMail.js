"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = exports.sendMail = void 0;
const nodemailer = __importStar(require("nodemailer"));
const env_1 = require("../config/env");
const transport = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    port: 465,
    secure: true,
    auth: {
        user: env_1.EMAIL_FROM,
        pass: env_1.EMAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    },
});
const sendMail = async ({ to, subject = "Email Alert from Auction Adda", html, from = `Auction Adda ${env_1.EMAIL_FROM}`, }) => {
    try {
        const info = await transport.sendMail({
            from,
            to,
            subject,
            html,
        });
        return info;
    }
    catch (error) {
        throw new Error(`Failed to send email: ${error instanceof Error ? error.message : String(error)}`);
    }
};
exports.sendMail = sendMail;
const sendOtpEmail = async ({ name, to, otp }) => {
    const subject = "OTP Request - Auction Adda";
    const html = `
    Dear ${name ? name : 'Sir/Madam'}, <br><br>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">One-Time Password (OTP)</h2>
      <p>Your OTP code is:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
        <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333;">${otp}</span>
      </div>
      <p>This code will expire in ${env_1.OTP_EXPIRY_MINUTES} minutes.</p>
      <p style="color: #888; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
    </div>
    <br>Regards<br>
    Team Auction Adda
  `;
    return (0, exports.sendMail)({
        to,
        subject,
        html
    });
};
exports.sendOtpEmail = sendOtpEmail;
