import { OTP_EXPIRY_MINUTES } from '../config/env';

interface OTPEntry {
    identifier: string; 
    code: string;
    expiresAt: Date;
    verified: boolean;
}

const otpStore: Map<string, OTPEntry> = new Map();

export class OTPService {
    generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    storeOTP(sessionKey: string, identifier: string): string {
        const code = this.generateOTP();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

        otpStore.set(sessionKey, {
            identifier,
            code,
            expiresAt,
            verified: false
        });

        return code;
    }

    verifyOTP(identifier: string, code: string): string {
        const otpEntry = otpStore.get(identifier);
        if (!otpEntry || otpEntry.expiresAt < new Date()) return '';
        
        if (otpEntry.code === code) {
            otpEntry.verified = true;
            return otpEntry.identifier;
        }
        return '';
    }

    isOTPVerified(identifier: string): boolean {
        return otpStore.get(identifier)?.verified || false;
    }

    invalidateOTP(sessionId: string): void {
        otpStore.delete(sessionId);
    }

    getIdentifier(sessionId: string): string {
        return otpStore.get(sessionId)?.identifier || '';
    }
}