import { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse";
import { AuthService } from "../services/auth.service";
import { FileService } from "../services/file.service";
import { FILE_UPLOAD_FOLDER } from "../config/env";
import { upload } from "../utils/multerConfig";
import { RegistrationService } from "../services/registration.service";
import { NotificationService } from "../services/notification.service";
import { NotificationMessage, NOTIFICATIONS, NotificationType } from "../constants/notification.constants";
import { AuctionService } from "../services/auction.service";
import { AuctionFileData } from "../types/file.types";
import { AuctionsHelper } from "../helpers/auctions.helpers";

const fileService = new FileService();
const registrationService = new RegistrationService();

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
          return ApiResponse.error(res, "User not found", 401, {
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
        } else {
          result = await fileService.uploadFile({
            name: req.file.filename,
            path: imagePath,
            url,
          });
        }
        if (result) {
          return ApiResponse.success(res, { fileId: result }, 200, "Image uploaded successfully");
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
        const { fileId, userId } = req.body;
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
          await registrationService.updateImageId(result, userId);
          await NotificationService.createNotification(
            userId,
            userId === req.userId ? NotificationMessage.IMAGE_UPDATE_BY_SELF : NotificationMessage.IMAGE_UPDATE_BY_ELSE,
            NOTIFICATIONS.IMAGE_UPDATE as NotificationType,
            req.userId,
            req.role
          );
          return ApiResponse.success(res, { fileId: result }, 200, "Image uploaded successfully");
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

  static userUploadForAuction = async (req: Request, res: Response) => {
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
        const { fileId, auctionId, type, showNotification } = req.body as AuctionFileData;
        const imagePath = req.file.path;
        const url = `${FILE_UPLOAD_FOLDER}${req.file.filename}`;
        let playerId = req.userId;
        let name = "", code = "";

        if (auctionId) {
          const auctionInfo = await AuctionService.getAuctionPlayerId(auctionId);
          if (!auctionInfo?.playerId) {
            await fileService.deleteUploadedFile(imagePath);
            return ApiResponse.error(res, "Auction Not Found", 200, { isNotFound: true });
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
        } else {
          result = await fileService.uploadFile({
            name: req.file.filename,
            path: imagePath,
            url,
          });
        }
        if (result) {
          if (fileId && showNotification) {
            if (type === "logo") {
              await NotificationService.createNotification(
                playerId,
                playerId === req.userId
                  ? NotificationMessage.AUCTION_IMAGE_UPDATE_BY_SELF
                  : NotificationMessage.AUCTION_IMAGE_UPDATE_BY_ELSE,
                NOTIFICATIONS.IMAGE_UPDATE as NotificationType,
                req.userId,
                req.role,
                AuctionsHelper.getNotificationJSON(name, "", code)
              );
            } else if(type === "qrcode") {
              await NotificationService.createNotification(
                playerId,
                playerId === req.userId
                  ? NotificationMessage.AUCTION_QRIMAGE_UPDATE_BY_SELF
                  : NotificationMessage.AUCTION_QRIMAGE_UPDATE_BY_ELSE,
                NOTIFICATIONS.IMAGE_UPDATE as NotificationType,
                req.userId,
                req.role,
                AuctionsHelper.getNotificationJSON(name, "", code)
              );
            }
          }
          return ApiResponse.success(res, { fileId: result }, 200, "Image uploaded successfully");
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
