"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTPService = void 0;
const env_1 = require("../config/env");
const otpStore = new Map();
class OTPService {
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    storeOTP(sessionKey, identifier) {
        const code = this.generateOTP();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + env_1.OTP_EXPIRY_MINUTES);
        otpStore.set(sessionKey, {
            identifier,
            code,
            expiresAt,
            verified: false
        });
        return code;
    }
    verifyOTP(identifier, code) {
        const otpEntry = otpStore.get(identifier);
        if (!otpEntry || otpEntry.expiresAt < new Date())
            return '';
        if (otpEntry.code === code) {
            otpEntry.verified = true;
            return otpEntry.identifier;
        }
        return '';
    }
    isOTPVerified(identifier) {
        return otpStore.get(identifier)?.verified || false;
    }
    invalidateOTP(sessionId) {
        otpStore.delete(sessionId);
    }
    getIdentifier(sessionId) {
        return otpStore.get(sessionId)?.identifier || '';
    }
}
exports.OTPService = OTPService;
