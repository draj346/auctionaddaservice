"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userUploadFile = exports.AddPlayersFile = exports.uploadFileForJoiningAuctionSchema = exports.userUploadForAuctionSchema = exports.uploadFile = void 0;
const joi_1 = __importDefault(require("joi"));
exports.uploadFile = joi_1.default.object({
    userId: joi_1.default.number().min(1).required(),
    fileId: joi_1.default.number().allow('', null).min(1).required(),
    image: joi_1.default.binary().required(),
});
exports.userUploadForAuctionSchema = joi_1.default.object({
    fileId: joi_1.default.number().allow('', null).min(1).required(),
    auctionId: joi_1.default.number().min(1).required(),
    image: joi_1.default.binary().required(),
    type: joi_1.default.string().valid("logo", "qrcode").required(),
});
exports.uploadFileForJoiningAuctionSchema = joi_1.default.object({
    auctionId: joi_1.default.number().min(1).required(),
    image: joi_1.default.binary().required(),
});
exports.AddPlayersFile = joi_1.default.object({
    file: joi_1.default.binary().required(),
});
exports.userUploadFile = joi_1.default.object({
    fileId: joi_1.default.number().allow('', null).min(1).required(),
    userId: joi_1.default.number().min(1).required(),
    image: joi_1.default.binary().required(),
});
