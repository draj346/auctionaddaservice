export const FileQueries = {
  findFileById: `SELECT * FROM files WHERE fileId = ?`,
  findMultipleFilesByIds: `SELECT fileId, url FROM files WHERE fileId in (?)`,
  insertFile: `INSERT INTO files (name, path, url) VALUES (?, ?, ?)`,
  updateFile: `
    UPDATE files SET 
      name = ?,
      path = ?,
      url = ?
    WHERE fileId = ?`,
};