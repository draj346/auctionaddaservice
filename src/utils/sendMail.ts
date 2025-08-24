import * as nodemailer from "nodemailer";
import { EMAIL_FROM, EMAIL_PASSWORD, OTP_EXPIRY_MINUTES } from "../config/env";
import { SentMessageInfo } from "nodemailer";

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

interface OtpEmailOptions {
  name: string;
  to: string | string[];
  otp: string;
}

const transport = nodemailer.createTransport({
  host: "smtpout.secureserver.net",
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_FROM,
    pass: EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendMail = async ({
  to,
  subject = "Email Alert from Auction Adda",
  html,
  from = `Auction Adda ${EMAIL_FROM}`,
}: EmailOptions): Promise<nodemailer.SentMessageInfo> => {
  try {
    const info = await transport.sendMail({
      from,
      to,
      subject,
      html,
    });
    return info;
  } catch (error) {
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const sendOtpEmail = async ({
  name,
  to,
  otp
}: OtpEmailOptions): Promise<SentMessageInfo> => {
  const subject = "OTP Request - Auction Adda"
  const html = `
    Dear ${name ? name : 'Sir/Madam'}, <br><br>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">One-Time Password (OTP)</h2>
      <p>Your OTP code is:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
        <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333;">${otp}</span>
      </div>
      <p>This code will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>
      <p style="color: #888; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
    </div>
    <br>Regards<br>
    Team Auction Adda
  `;

  return sendMail({
    to,
    subject,
    html
  });
};
