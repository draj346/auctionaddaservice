"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePendingActionSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.updatePendingActionSchema = joi_1.default.object({
    id: joi_1.default.number().integer().min(1).required().messages({
        "number.base": "Player ID must be a number",
        "number.integer": "Player ID must be an integer",
        "number.min": "Player ID must be at least 10001",
        "any.required": "Player ID is required",
    }),
    status: joi_1.default.boolean().required(),
});
