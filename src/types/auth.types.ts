export interface OTPSendRequest {
  identifier: string;
  method: 'email' | 'otp';
}

export interface OTPVerifyRequest {
  sessionId: string;
  code: string;
}

export interface ResetPasswordRequest {
  sessionId: string;
  password: string;
}

export interface LoginRequest {
  identifier?: string;
  method?: 'password' | 'otp';
  password?: string;
  code?: string;
  sessionId?: string;
}

export interface PasswordSchema {
  password: string;
}

export interface PlayerImageSchema {
  image: string;
}
