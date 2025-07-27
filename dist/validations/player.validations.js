"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminsPaginationSchema = exports.playerPaginationSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.playerPaginationSchema = joi_1.default.object({
    page: joi_1.default.number().required().min(1),
    search: joi_1.default.string().trim().allow('').pattern(/^[a-zA-Z0-9\s]*$/).required(),
    approved: joi_1.default.string().valid("all", "Yes", "No").required(),
    active: joi_1.default.string().valid("all", "Yes", "No").required(),
    sort: joi_1.default.string().trim().allow('').required()
});
exports.adminsPaginationSchema = joi_1.default.object({
    page: joi_1.default.number().required().min(1),
    search: joi_1.default.string().trim().allow('').pattern(/^[a-zA-Z0-9\s]*$/).required(),
});
