"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileController = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const auth_service_1 = require("../services/auth.service");
const file_service_1 = require("../services/file.service");
const env_1 = require("../config/env");
const multerConfig_1 = require("../utils/multerConfig");
const fileService = new file_service_1.FileService();
class FileController {
}
exports.FileController = FileController;
_a = FileController;
FileController.uploadImage = async (req, res) => {
    try {
        multerConfig_1.upload.single("image")(req, res, async (err) => {
            if (err) {
                return apiResponse_1.ApiResponse.error(res, err.message, 400);
            }
            if (!req.file) {
                return apiResponse_1.ApiResponse.error(res, "No image uploaded", 400);
            }
            const { userId, fileId } = req.body;
            const imagePath = req.file.path;
            const url = `${env_1.FILE_UPLOAD_FOLDER}${req.file.filename}`;
            const playerId = req.userId || userId;
            const isValidUser = await auth_service_1.AuthService.isValidUser(playerId);
            if (!isValidUser) {
                fileService.deleteUploadedFile(imagePath);
                return apiResponse_1.ApiResponse.error(res, "User not found", 401);
            }
            let result = null;
            if (fileId) {
                result = await fileService.updateFile({
                    name: req.file.filename,
                    path: imagePath,
                    url,
                    fileId,
                });
            }
            else {
                result = await fileService.uploadFile({
                    name: req.file.filename,
                    path: imagePath,
                    url,
                });
            }
            if (result) {
                return apiResponse_1.ApiResponse.success(res, { fileId: result }, 200, "Image uploaded successfully");
            }
            else {
                return apiResponse_1.ApiResponse.error(res, "Upload failed");
            }
        });
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Uploading failed. Please try again.");
    }
};
