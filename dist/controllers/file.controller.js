"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileController = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const auth_service_1 = require("../services/auth.service");
const file_service_1 = require("../services/file.service");
const env_1 = require("../config/env");
const multerConfig_1 = require("../utils/multerConfig");
const registration_service_1 = require("../services/registration.service");
const notification_service_1 = require("../services/notification.service");
const notification_constants_1 = require("../constants/notification.constants");
const auction_service_1 = require("../services/auction.service");
const auctions_helpers_1 = require("../helpers/auctions.helpers");
const fileService = new file_service_1.FileService();
const registrationService = new registration_service_1.RegistrationService();
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
                return apiResponse_1.ApiResponse.error(res, "User not found", 401, {
                    isNotFound: true,
                });
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
FileController.userUploadImage = async (req, res) => {
    try {
        multerConfig_1.upload.single("image")(req, res, async (err) => {
            if (err) {
                return apiResponse_1.ApiResponse.error(res, err.message, 400, {
                    isUpdateFailed: true,
                });
            }
            if (!req.file) {
                return apiResponse_1.ApiResponse.error(res, "No image uploaded", 400, {
                    isNotFound: true,
                });
            }
            const { fileId, userId } = req.body;
            const imagePath = req.file.path;
            const url = `${env_1.FILE_UPLOAD_FOLDER}${req.file.filename}`;
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
                await registrationService.updateImageId(result, userId);
                await notification_service_1.NotificationService.createNotification(userId, userId === req.userId ? notification_constants_1.NotificationMessage.IMAGE_UPDATE_BY_SELF : notification_constants_1.NotificationMessage.IMAGE_UPDATE_BY_ELSE, notification_constants_1.NOTIFICATIONS.IMAGE_UPDATE, req.userId, req.role);
                return apiResponse_1.ApiResponse.success(res, { fileId: result }, 200, "Image uploaded successfully");
            }
            else {
                return apiResponse_1.ApiResponse.error(res, "Upload failed", 200, {
                    isUpdateFailed: true,
                });
            }
        });
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Uploading failed. Please try again.", 500, {
            isError: true,
        });
    }
};
FileController.userUploadForAuction = async (req, res) => {
    try {
        multerConfig_1.upload.single("image")(req, res, async (err) => {
            if (err) {
                return apiResponse_1.ApiResponse.error(res, err.message, 400, {
                    isUpdateFailed: true,
                });
            }
            if (!req.file) {
                return apiResponse_1.ApiResponse.error(res, "No image uploaded", 400, {
                    isNotFound: true,
                });
            }
            const { fileId, auctionId, type } = req.body;
            const imagePath = req.file.path;
            const url = `${env_1.FILE_UPLOAD_FOLDER}${req.file.filename}`;
            let playerId = req.userId;
            let name = "", code = "";
            if (auctionId) {
                const auctionInfo = await auction_service_1.AuctionService.getAuctionPlayerId(auctionId);
                if (!auctionInfo?.playerId) {
                    return apiResponse_1.ApiResponse.error(res, "Auction Not Found", 200, { isNotFound: true });
                }
                playerId = auctionInfo.playerId;
                name = auctionInfo.name;
                code = auctionInfo.code;
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
                if (fileId) {
                    if (type === "logo") {
                        await notification_service_1.NotificationService.createNotification(playerId, playerId === req.userId
                            ? notification_constants_1.NotificationMessage.AUCTION_IMAGE_UPDATE_BY_SELF
                            : notification_constants_1.NotificationMessage.AUCTION_IMAGE_UPDATE_BY_ELSE, notification_constants_1.NOTIFICATIONS.IMAGE_UPDATE, req.userId, req.role, auctions_helpers_1.AuctionsHelper.getNotificationJSON(name, "", code));
                    }
                    else {
                        await notification_service_1.NotificationService.createNotification(playerId, playerId === req.userId
                            ? notification_constants_1.NotificationMessage.AUCTION_QRIMAGE_UPDATE_BY_SELF
                            : notification_constants_1.NotificationMessage.AUCTION_QRIMAGE_UPDATE_BY_ELSE, notification_constants_1.NOTIFICATIONS.IMAGE_UPDATE, req.userId, req.role, auctions_helpers_1.AuctionsHelper.getNotificationJSON(name, "", code));
                    }
                }
                return apiResponse_1.ApiResponse.success(res, { fileId: result }, 200, "Image uploaded successfully");
            }
            else {
                return apiResponse_1.ApiResponse.error(res, "Upload failed", 200, {
                    isUpdateFailed: true,
                });
            }
        });
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Uploading failed. Please try again.", 500, {
            isError: true,
        });
    }
};
