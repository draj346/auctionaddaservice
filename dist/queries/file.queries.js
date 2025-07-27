"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileQueririesFn = exports.FileQueries = void 0;
exports.FileQueries = {
    findFileById: `SELECT * FROM files WHERE fileId = ?`,
    insertFile: `INSERT INTO files (name, path, url) VALUES (?, ?, ?)`,
    updateFile: `
    UPDATE files SET 
      name = ?,
      path = ?,
      url = ?
    WHERE fileId = ?`,
};
exports.FileQueririesFn = {
    getFilesByIds: (fileIds) => `SELECT fileId, url as path FROM files WHERE fileId IN (${fileIds.join(",")})`,
};
