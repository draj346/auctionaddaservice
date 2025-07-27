"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWorkStatusSchema = exports.insertMessageSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.insertMessageSchema = joi_1.default.object({
    name: joi_1.default.string().trim().required(),
    mobile: joi_1.default.string().trim().pattern(/^[5-9][0-9]{9}$/).required(),
    email: joi_1.default.string().trim().email().required(),
    subject: joi_1.default.string().trim().required().max(200),
    message: joi_1.default.string().trim().required().max(500),
});
exports.updateWorkStatusSchema = joi_1.default.object({
    id: joi_1.default.number().integer().min(1).required(),
});
