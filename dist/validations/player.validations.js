"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.updateProfileSchema = joi_1.default.object({
    page: joi_1.default.number().required().min(1),
    search: joi_1.default.string().trim().allow('').alphanum().required(),
    owner: joi_1.default.string().valid("all", "Yes", "No").required(),
    approved: joi_1.default.string().valid("all", "Yes", "No").required(),
    sort: joi_1.default.string().trim().allow('').required()
});
