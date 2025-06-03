import { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse";
import upload from "../utils/multerConfig";
import { AuthService } from "../services/auth.service";
import { FileService } from "../services/file.service";
import { FILE_UPLOAD_LOCATION } from "../config/env";

const fileService = new FileService();

export class FileController {
  static uploadImage = async (req: Request, res: Response) => {
    try {
      upload.single("image")(req, res, async (err) => {
        if (err) {
          return ApiResponse.error(res, err.message, 400);
        }

        if (!req.file) {
          return ApiResponse.error(res, "No image uploaded", 400);
        }
        const { userId, fileId } = req.body;
        const imagePath = req.file.path;
        const url = `${FILE_UPLOAD_LOCATION}${req.file.filename}`;

        const playerId = req?.isAuthenticated ? req.userId : userId;
        const isValidUser = await AuthService.isValidUser(playerId);
        if (!isValidUser) {
          fileService.deleteUploadedFile(imagePath);
          return ApiResponse.error(res, "User not found", 401);
        }

        let result = null;

        if (fileId) {
          result = await fileService.updateFile({
            name: req.file.filename,
            path: imagePath,
            url,
            fileId
          });
        } else {
          result = await fileService.uploadFile({
            name: req.file.filename,
            path: imagePath,
            url
          });
        }
        if (result) {
          return ApiResponse.success(res, { fileId: result}, 200, "Image uploaded successfully");
        } else {
          return ApiResponse.error(res, "Upload failed");
        }
      });
    } catch (error) {
      ApiResponse.error(
        res,
        error instanceof Error ? error.message : "Upload failed"
      );
    }
  };

 
}
