"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
const promises_1 = __importDefault(require("fs/promises"));
const file_queries_1 = require("../queries/file.queries");
class FileService {
    async uploadFile(data) {
        const [result] = await db_config_1.default.execute(file_queries_1.FileQueries.insertFile, [data.name, data.path, data.url]);
        return result.insertId;
    }
    async getFile(fileId) {
        const [result] = await db_config_1.default.execute(file_queries_1.FileQueries.findFileById, [fileId]);
        if (result.length > 0) {
            return result[0];
        }
        return null;
    }
    async updateFile(data) {
        if (data.fileId) {
            const existing = await this.getFile(data.fileId);
            if (existing) {
                this.deleteUploadedFile(existing.path);
            }
            const [result] = await db_config_1.default.execute(file_queries_1.FileQueries.updateFile, [
                data.name,
                data.path,
                data.url,
                data.fileId,
            ]);
            return result.affectedRows === 1 ? data.fileId : 0;
        }
        else {
            return this.uploadFile(data);
        }
    }
    async updateFileOnly(data) {
        const [result] = await db_config_1.default.execute(file_queries_1.FileQueries.updateFile, [
            data.name,
            data.path,
            data.url,
            data.fileId,
        ]);
        return result.affectedRows > 0;
    }
    async deleteUploadedFile(filePath) {
        try {
            await promises_1.default.access(filePath);
            await promises_1.default.unlink(filePath);
        }
        catch (error) {
            console.error("Error deleting file:", error);
        }
    }
    async getFiles(fileId) {
        const [result] = await db_config_1.default.execute(file_queries_1.FileQueririesFn.getFilesByIds(fileId));
        if (result.length > 0) {
            return result;
        }
        return null;
    }
}
exports.FileService = FileService;
