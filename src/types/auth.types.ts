export interface OTPSendRequest {
  identifier: string;
  method: 'email' | 'sms';
}

export interface OTPVerifyRequest {
  uniqueIdentifier: string;
  code: string;
}

export interface ResetPasswordRequest {
  identifier: string;
  method: 'email' | 'sms';
  uniqueIdentifier: string;
  newPassword: string;
}

export interface LoginRequest {
  identifier: string;
  method: 'password' | 'otp';
  password?: string;
  otp?: string;
  uniqueIdentifier: string;
}