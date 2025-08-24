import dotenv from "dotenv";
import { sendOtpEmail } from "../utils/sendMail";

dotenv.config();

export class EmailService {
  async sendOTP(email: string, code: string, name: string): Promise<boolean> {
    console.log(`Sending OTP ${code} to email: ${email}`);
    try {
      await sendOtpEmail({name, to: email, otp: code})
      return true;
    } catch (error) {
      console.error("SendGrid Error:", error);
      return false;
    }
  }
}
