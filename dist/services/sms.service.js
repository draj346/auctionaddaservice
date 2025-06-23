"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsService = void 0;
const twilio_1 = __importDefault(require("twilio"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
const client = (0, twilio_1.default)(accountSid, authToken);
class SmsService {
    async sendOTP(mobile, code) {
        console.log(`Sending OTP ${code} to mobile: ${mobile}`);
        try {
            await client.messages.create({
                body: `Your Auction OTP is: ${code}`,
                from: twilioPhone,
                to: `+91${mobile}`,
            });
            return true;
        }
        catch (error) {
            console.error("Twilio Error:", error);
            return false;
        }
    }
}
exports.SmsService = SmsService;
