"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.playerIdsOptionalSchema = exports.playerIdsSchema = exports.playerIdSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const withMeta = (schema, meta) => {
    return schema.meta({ __customMeta: meta });
};
exports.playerIdSchema = joi_1.default.object({
    playerId: joi_1.default.number().integer().min(10001).required().messages({
        "number.base": "Player ID must be a number",
        "number.integer": "Player ID must be an integer",
        "number.min": "Player ID must be at least 10001",
        "any.required": "Player ID is required",
    }),
    // { isValidationFailed: true }
});
exports.playerIdsSchema = joi_1.default.object({
    playerIds: joi_1.default.array()
        .items(joi_1.default.number()
        .integer()
        .min(10001)
        .required()
        .messages({
        'number.base': 'Player ID must be a number',
        'number.integer': 'Player ID must be an integer',
        'number.min': 'Player ID must be at least 10001'
    }))
        .min(1)
        .required()
        .messages({
        'array.base': 'Player IDs must be an array',
        'array.min': 'At least one player ID is required',
        'any.required': 'Player IDs are required'
    })
});
exports.playerIdsOptionalSchema = joi_1.default.object({
    playerIds: joi_1.default.array()
        .items(joi_1.default.number()
        .integer()
        .min(10001)
        .messages({
        'number.base': 'Player ID must be a number',
        'number.integer': 'Player ID must be an integer',
        'number.min': 'Player ID must be at least 10001'
    }))
        .optional()
        .default([]) // Add default empty array
        .messages({
        'array.base': 'Player IDs must be an array',
        'array.includes': 'All player IDs must be valid numbers',
    })
});
