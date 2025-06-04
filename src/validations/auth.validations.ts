import Joi from "joi";
import {
  OTPSendRequest,
  OTPVerifyRequest,
  ResetPasswordRequest,
  LoginRequest,
} from "../types/auth.types";

export const sendOTPSchema = Joi.object<OTPSendRequest>({
  identifier: Joi.string()
    .trim()
    .required()
    .when("method", {
      is: "email",
      then: Joi.string()
        .email()
        .lowercase()
        .message("Invalid email format")
        .options({
          errors: {
            wrap: {
              label: false,
            },
          },
        }),
      otherwise: Joi.string()
        .pattern(/^[5-9][0-9]{9}$/)
        .message("Invalid mobile number format"),
    }),
  method: Joi.string().valid("email", "otp").required(),
});

export const verifyOTPSchema = Joi.object<OTPVerifyRequest>({
  sessionId: Joi.string().required(),
  code: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    "string.length": "OTP must be exactly 6 digits",
    "string.pattern.base": "OTP must contain only digits",
  }),
});

export const resetPasswordSchema = Joi.object<ResetPasswordRequest>({
  sessionId: Joi.string()
    .required()
    .messages({
      "string.pattern.base": "Invalid session ID format",
      "any.required": "Session ID is required",
    }),
  password: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object<LoginRequest>({
  identifier: Joi.when("method", {
    is: "password",
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),
  method: Joi.string().valid("password", "otp").required(),
  password: Joi.when("method", {
    is: "password",
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),
  code: Joi.when("method", {
    is: "otp",
    then: Joi.string().length(6).pattern(/^\d+$/).required().messages({
      "string.length": "OTP must be exactly 6 digits",
      "string.pattern.base": "OTP must contain only digits",
    }),
    otherwise: Joi.forbidden(),
  }),
  sessionId: Joi.when("method", {
    is: "otp",
    then: Joi.string()
      .required(),
    otherwise: Joi.forbidden(),
  }),
}).messages({
  "object.missing": "Either password or OTP must be provided based on method",
});
