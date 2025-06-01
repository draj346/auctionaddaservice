import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER!;

const client = twilio(accountSid, authToken);

export class SmsService {
  async sendOTP(mobile: string, code: string): Promise<boolean> {
    console.log(`Sending OTP ${code} to mobile: ${mobile}`);
    try {
      await client.messages.create({
        body: `Your Auction OTP is: ${code}`,
        from: twilioPhone,
        to: `+91${mobile}`,
      });
      return true;
    } catch (error) {
      console.error("Twilio Error:", error);
      return false;
    }
  }
}
