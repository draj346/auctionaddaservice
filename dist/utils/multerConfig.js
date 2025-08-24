"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentUpload = exports.uploadToMemory = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const env_1 = require("../config/env");
// Configure storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, env_1.FILE_UPLOAD_LOCATION); // Save directory
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const paymentStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, env_1.PAYMENT_FILE_UPLOAD_LOCATION); // Save directory
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
// File filter for images only
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extValid = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimeValid = allowedTypes.test(file.mimetype);
    if (extValid && mimeValid) {
        cb(null, true);
    }
    else {
        cb(new Error('Only images are allowed!'));
    }
};
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: fileFilter
});
exports.upload = upload;
const paymentUpload = (0, multer_1.default)({
    storage: paymentStorage,
    limits: { fileSize: 1 * 1024 * 1024 },
    fileFilter: fileFilter
});
exports.paymentUpload = paymentUpload;
const memoryStorage = multer_1.default.memoryStorage();
const uploadToMemory = (0, multer_1.default)({
    storage: memoryStorage,
    limits: { fileSize: 10 * 1024 * 1024 }
});
exports.uploadToMemory = uploadToMemory;
