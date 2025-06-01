import Joi from 'joi';
import { 
    OTPSendRequest, 
    OTPVerifyRequest, 
    ResetPasswordRequest, 
    LoginRequest 
} from '../types/auth.types';

export const sendOTPSchema = Joi.object<OTPSendRequest>({
    identifier: Joi.string().required(),
    method: Joi.string().valid('email', 'sms').required()
});

export const verifyOTPSchema = Joi.object<OTPVerifyRequest>({
    uniqueIdentifier: Joi.string().required(),
    code: Joi.string().length(6).pattern(/^\d+$/).required()
        .messages({
            'string.length': 'OTP must be exactly 6 digits',
            'string.pattern.base': 'OTP must contain only digits'
        })
});

export const resetPasswordSchema = Joi.object<ResetPasswordRequest>({
    identifier: Joi.string().required(),
    method: Joi.string().valid('email', 'sms').required(),
    uniqueIdentifier: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
});

export const loginSchema = Joi.object<LoginRequest>({
    identifier: Joi.string().required(),
    method: Joi.string().valid('password', 'otp').required(),
    password: Joi.when('method', {
        is: 'password',
        then: Joi.string().required(),
        otherwise: Joi.forbidden()
    }),
    otp: Joi.when('method', {
        is: 'otp',
        then: Joi.string().length(6).pattern(/^\d+$/).required()
            .messages({
                'string.length': 'OTP must be exactly 6 digits',
                'string.pattern.base': 'OTP must contain only digits'
            }),
        otherwise: Joi.forbidden()
    }),
    uniqueIdentifier: Joi.string().required()
}).messages({
    'object.missing': 'Either password or OTP must be provided based on method'
});
