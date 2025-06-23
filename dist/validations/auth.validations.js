"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.resetPasswordSchema = exports.verifyOTPSchema = exports.sendOTPSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.sendOTPSchema = joi_1.default.object({
    identifier: joi_1.default.string()
        .trim()
        .required()
        .when("method", {
        is: "email",
        then: joi_1.default.string()
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
        otherwise: joi_1.default.string()
            .pattern(/^[5-9][0-9]{9}$/)
            .message("Invalid mobile number format"),
    }),
    method: joi_1.default.string().valid("email", "otp").required(),
});
exports.verifyOTPSchema = joi_1.default.object({
    sessionId: joi_1.default.string().required(),
    code: joi_1.default.string().length(6).pattern(/^\d+$/).required().messages({
        "string.length": "OTP must be exactly 6 digits",
        "string.pattern.base": "OTP must contain only digits",
    }),
});
exports.resetPasswordSchema = joi_1.default.object({
    sessionId: joi_1.default.string()
        .required()
        .messages({
        "string.pattern.base": "Invalid session ID format",
        "any.required": "Session ID is required",
    }),
    password: joi_1.default.string().min(6).required(),
});
exports.loginSchema = joi_1.default.object({
    identifier: joi_1.default.when("method", {
        is: "password",
        then: joi_1.default.string().required(),
        otherwise: joi_1.default.forbidden(),
    }),
    method: joi_1.default.string().valid("password", "otp").required(),
    password: joi_1.default.when("method", {
        is: "password",
        then: joi_1.default.string().required(),
        otherwise: joi_1.default.forbidden(),
    }),
    code: joi_1.default.when("method", {
        is: "otp",
        then: joi_1.default.string().length(6).pattern(/^\d+$/).required().messages({
            "string.length": "OTP must be exactly 6 digits",
            "string.pattern.base": "OTP must contain only digits",
        }),
        otherwise: joi_1.default.forbidden(),
    }),
    sessionId: joi_1.default.when("method", {
        is: "otp",
        then: joi_1.default.string()
            .required(),
        otherwise: joi_1.default.forbidden(),
    }),
}).messages({
    "object.missing": "Either password or OTP must be provided based on method",
});
