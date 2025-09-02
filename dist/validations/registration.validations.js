"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addProfileSchema = exports.updateProfileByRoleSchema = exports.updateProfileSchema = exports.initialRegistrationSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.initialRegistrationSchema = joi_1.default.object({
    name: joi_1.default.string().trim().pattern(/^[\p{L}\s]+$/u).required(),
    mobile: joi_1.default.string().trim().pattern(/^[5-9][0-9]{9}$/).required(),
    email: joi_1.default.string().trim().email().required(),
    state: joi_1.default.string().trim().pattern(/^[\p{L}\d\s().-]+$/u).required(),
    district: joi_1.default.string().trim().pattern(/^[\p{L}\d\s().-]+$/u).required(),
});
exports.updateProfileSchema = joi_1.default.object({
    playerId: joi_1.default.number().required().min(1),
    jerseyNumber: joi_1.default.string()
        .pattern(/^[0-9]{1,6}$/)
        .allow('', null)
        .optional()
        .custom((value, helpers) => {
        if (value === '' || value === null)
            return null;
        const num = parseInt(value, 10);
        if (num < 1)
            return helpers.error('number.min');
        if (num > 100000)
            return helpers.error('number.max');
        return num; // Return as number
    }),
    tShirtSize: joi_1.default.string().trim().allow('', null).alphanum().optional(),
    lowerSize: joi_1.default.string().trim().allow('', null).alphanum().optional(),
    hasCricheroesProfile: joi_1.default.boolean().allow('', null).optional(),
    isPaidPlayer: joi_1.default.boolean().allow('', null).optional(),
    image: joi_1.default.number().allow('', null).min(1).optional(),
    pricePerMatch: joi_1.default.number().allow('', null).min(1).max(100000).optional(),
    willJoinAnyOwner: joi_1.default.boolean().allow('', null).optional(),
    playerRole: joi_1.default.string().valid("Top-order Batsman", "Middle-order Batsman", 'Bowler', 'All-rounder', 'Lower-order Batsman', 'Opening Batsman', 'None').optional().allow(null),
    battingStyle: joi_1.default.string().valid('Left-hand Batsman', 'Right-hand Batsman').optional().allow(null),
    bowlingStyle: joi_1.default.string().valid('Right-arm fast', 'Right-arm medium', 'Left-arm fast', 'Left-arm medium', 'Slow left-arm orthodox', 'Slow left-arm chinaman', 'Right-arm Off Break', 'Right-arm Leg Break', 'None').optional().allow(null),
    description: joi_1.default.string().valid().max(1000).optional().allow(null)
});
exports.updateProfileByRoleSchema = joi_1.default.object({
    state: joi_1.default.string().trim().pattern(/^[\p{L}\d\s().-]+$/u).required(),
    district: joi_1.default.string().trim().pattern(/^[\p{L}\d\s().-]+$/u).required(),
    jerseyNumber: joi_1.default.string()
        .pattern(/^[0-9]{1,6}$/)
        .allow('', null)
        .optional()
        .custom((value, helpers) => {
        if (value === '' || value === null)
            return null;
        const num = parseInt(value, 10);
        if (num < 1)
            return helpers.error('number.min');
        if (num > 100000)
            return helpers.error('number.max');
        return num; // Return as number
    }),
    tShirtSize: joi_1.default.string().trim().allow('', null).alphanum().optional(),
    lowerSize: joi_1.default.string().trim().allow('', null).alphanum().optional(),
    hasCricheroesProfile: joi_1.default.boolean().allow('', null).optional(),
    isPaidPlayer: joi_1.default.boolean().allow('', null).optional(),
    image: joi_1.default.number().allow('', null).min(1).optional(),
    pricePerMatch: joi_1.default.number().allow('', null).min(1).max(100000).optional(),
    willJoinAnyOwner: joi_1.default.boolean().allow('', null).optional(),
    playerRole: joi_1.default.string().valid("Top-order Batsman", "Middle-order Batsman", 'Bowler', 'All-rounder', 'Lower-order Batsman', 'Opening Batsman', 'None').optional().allow(null),
    battingStyle: joi_1.default.string().valid('Left-hand Batsman', 'Right-hand Batsman').optional().allow(null),
    bowlingStyle: joi_1.default.string().valid('Right-arm fast', 'Right-arm medium', 'Left-arm fast', 'Left-arm medium', 'Slow left-arm orthodox', 'Slow left-arm chinaman', 'Right-arm Off Break', 'Right-arm Leg Break', 'None').optional().allow(null),
    description: joi_1.default.string().valid().max(1000).optional().allow(null)
});
exports.addProfileSchema = joi_1.default.object({
    name: joi_1.default.string().trim().pattern(/^[\p{L}\s]+$/u).required(),
    mobile: joi_1.default.string().trim().pattern(/^[5-9][0-9]{9}$/).required(),
    email: joi_1.default.string().trim().email().required(),
    state: joi_1.default.string().trim().pattern(/^[\p{L}\d\s().-]+$/u).required(),
    district: joi_1.default.string().trim().pattern(/^[\p{L}\d\s().-]+$/u).required(),
    jerseyNumber: joi_1.default.string()
        .pattern(/^[0-9]{1,6}$/)
        .allow('', null)
        .optional()
        .custom((value, helpers) => {
        if (value === '' || value === null)
            return null;
        const num = parseInt(value, 10);
        if (num < 1)
            return helpers.error('number.min');
        if (num > 100000)
            return helpers.error('number.max');
        return num; // Return as number
    }),
    tShirtSize: joi_1.default.string().trim().allow('', null).alphanum().optional(),
    lowerSize: joi_1.default.string().trim().allow('', null).alphanum().optional(),
    hasCricheroesProfile: joi_1.default.boolean().allow('', null).optional(),
    isPaidPlayer: joi_1.default.boolean().allow('', null).optional(),
    image: joi_1.default.number().allow('', null).min(1).optional(),
    pricePerMatch: joi_1.default.number().allow('', null).min(1).max(100000).optional(),
    willJoinAnyOwner: joi_1.default.boolean().allow('', null).optional(),
    playerRole: joi_1.default.string().valid("Top-order Batsman", "Middle-order Batsman", 'Bowler', 'All-rounder', 'Lower-order Batsman', 'Opening Batsman', 'None').optional().allow(null),
    battingStyle: joi_1.default.string().valid('Left-hand Batsman', 'Right-hand Batsman').optional().allow(null),
    bowlingStyle: joi_1.default.string().valid('Right-arm fast', 'Right-arm medium', 'Left-arm fast', 'Left-arm medium', 'Slow left-arm orthodox', 'Slow left-arm chinaman', 'Right-arm Off Break', 'Right-arm Leg Break', 'None').optional().allow(null),
    description: joi_1.default.string().valid().max(1000).optional().allow(null)
});
