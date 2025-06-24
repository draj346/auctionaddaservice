import { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse";
import { AuthService } from "../services/auth.service";
import { FileService } from "../services/file.service";
import { FILE_UPLOAD_FOLDER, FILE_UPLOAD_LOCATION } from "../config/env";
import { upload } from "../utils/multerConfig";

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
        const url = `${FILE_UPLOAD_FOLDER}${req.file.filename}`;

        const playerId = req.userId || userId;
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
            fileId,
          });
        } else {
          result = await fileService.uploadFile({
            name: req.file.filename,
            path: imagePath,
            url,
          });
        }
        if (result) {
          return ApiResponse.success(
            res,
            { fileId: result },
            200,
            "Image uploaded successfully"
          );
        } else {
          return ApiResponse.error(res, "Upload failed");
        }
      });
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Uploading failed. Please try again.");
    }
  };

   static userUploadImage = async (req: Request, res: Response) => {
    try {
      upload.single("image")(req, res, async (err) => {
        if (err) {
          return ApiResponse.error(res, err.message, 400, {
            isUpdateFailed: true,
          });
        }

        if (!req.file) {
          return ApiResponse.error(res, "No image uploaded", 400, {
            isNotFound: true,
          });
        }
        const { fileId } = req.body;
        const imagePath = req.file.path;
        const url = `${FILE_UPLOAD_FOLDER}${req.file.filename}`;
          
        let result = null;

        if (fileId) {
          result = await fileService.updateFile({
            name: req.file.filename,
            path: imagePath,
            url,
            fileId,
          });
        } else {
          result = await fileService.uploadFile({
            name: req.file.filename,
            path: imagePath,
            url,
          });
        }
        if (result) {
          return ApiResponse.success(
            res,
            { fileId: result },
            200,
            "Image uploaded successfully"
          );
        } else {
          return ApiResponse.error(res, "Upload failed", 200, {
            isUpdateFailed: true,
          });
        }
      });
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Uploading failed. Please try again.", 500, {
        isError: true,
      });
    }
  };
}
