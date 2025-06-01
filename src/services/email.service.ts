import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export class EmailService {
  async sendOTP(email: string, code: string): Promise<boolean> {
    console.log(`Sending OTP ${code} to email: ${email}`);
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: "Your One-Time Password (OTP)",
      html: `
      <div>
        <h3>Verification Code</h3>
        <p>Your OTP is: <strong>${code}</strong></p>
        <p>Expires in 5 minutes.</p>
      </div>
    `,
    };

    try {
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error("SendGrid Error:", error);
      return false;
    }
  }
}
