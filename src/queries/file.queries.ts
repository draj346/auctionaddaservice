export const FileQueries = {
  findFileById: `SELECT * FROM files WHERE fileId = ?`,
  insertFile: `INSERT INTO files (name, path, url) VALUES (?, ?, ?)`,
  updateFile: `
    UPDATE files SET 
      name = ?,
      path = ?,
      url = ?
    WHERE fileId = ?`,
};

export const FileQueririesFn = {
  getFilesByIds: (fileIds: number[]) => `SELECT fileId, url as path, name FROM files WHERE fileId IN (${fileIds.join(",")})`,
}