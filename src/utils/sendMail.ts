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

export const sendOtpEmail = async ({ name, to, otp }: OtpEmailOptions): Promise<SentMessageInfo> => {
  const subject = "OTP Request - Auction Adda";
  const html = `
    Dear ${name ? name : "Sir/Madam"}, <br><br>
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
    html,
  });
};

export const sendRegistrationEmail = async (to: string | string[], name: string): Promise<SentMessageInfo> => {
  const subject = "Welcome to AuctionAdda! Complete Your Registration by Setting Your Password";
  const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
      <div style="background: linear-gradient(to right, #FF7A00, #e06d00); padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
        <h1 style="color: white; margin: 0;">Welcome to AuctionAdda!</h1>
      </div>
      
      <div style="background-color: white; padding: 25px; border-radius: 0 0 5px 5px;">
        <p>Dear ${name ? name : "Sir/Madam"},</p>
        
        <p>Congratulations and welcome to AuctionAdda - the ultimate cricket player auction platform!</p>
        
        <p>Your registration has been successfully completed. We're excited to have you on board as we bring the thrill of cricket auctions to your fingertips.</p>
        
        <div style="background-color: #fff5eb; padding: 15px; border-left: 4px solid #FF7A00; margin: 20px 0;">
          <p><strong>Next Steps:</strong></p>
          <p>To access your account, you'll need to set up your password. Please visit our password setup page:</p>
          <p style="text-align: center; margin: 20px 0;">
            <a href="https://auctionadda.com/forgot-password" 
              style="background-color: #FF7A00; color: white; padding: 12px 25px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Set Your Password
            </a>
          </p>
        </div>
        
        <p>If you have any questions or need assistance, feel free to contact our support team at support@auctionadda.com.</p>
        
        <p>Get ready to experience the excitement of cricket auctions like never before!</p>
        
        <p>Best regards,<br>
        <strong>The AuctionAdda Team</strong></p>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #777; font-size: 12px;">
        <p>© 2023 AuctionAdda. All rights reserved.</p>
        <p>You're receiving this email because you registered on AuctionAdda.com</p>
      </div>
    </div>
  `;

  return sendMail({
    to,
    subject,
    html,
  });
};
