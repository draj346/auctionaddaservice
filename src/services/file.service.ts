import pool from "../config/db.config";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import fs from "fs/promises";
import { FileQueries } from "../queries/file.queries";
import { FilePathSchema, FileSchemaProps } from "../types/file.types";

export class FileService {
  async uploadFile(data: FileSchemaProps): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      FileQueries.insertFile,
      [data.name, data.path, data.url]
    );

    return result.insertId;
  }

  async getFile(fileId: number): Promise<FileSchemaProps | null> {
    const [result] = await pool.execute<RowDataPacket[]>(
      FileQueries.findFileById,
      [fileId]
    );

    if (result.length > 0) {
      return result[0] as FileSchemaProps;
    }

    return null;
  }

  async updateFile(data: FileSchemaProps): Promise<number> {
    if (data.fileId) {
      const existing = await this.getFile(data.fileId);
      if (existing) {
        this.deleteUploadedFile(existing.path);
      }
       const [result] = await pool.execute<ResultSetHeader>(
          FileQueries.updateFile,
          [data.name, data.path, data.url, data.fileId]
        );
        return result.affectedRows === 1 ? data.fileId : 0;
    } else {
      return this.uploadFile(data);
    }
  }

  async deleteUploadedFile(filePath: string): Promise<void> {
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  }

  async getFiles(fileId: number[]): Promise<FilePathSchema[] | null> {
    const [result] = await pool.execute<RowDataPacket[]>(
      FileQueries.findMultipleFilesByIds,
      [fileId]
    );

    if (result.length > 0) {
      return result[0] as FilePathSchema[];
    }

    return null;
  }
}
