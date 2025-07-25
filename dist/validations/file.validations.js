"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPlayersFile = exports.uploadFile = void 0;
const joi_1 = __importDefault(require("joi"));
exports.uploadFile = joi_1.default.object({
    userId: joi_1.default.number().min(1).required(),
    fileId: joi_1.default.number().allow('', null).min(1).required(),
    image: joi_1.default.binary().required(),
});
exports.AddPlayersFile = joi_1.default.object({
    file: joi_1.default.binary().required(),
});
