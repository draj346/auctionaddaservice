import { Request, Response } from "express";
import { AuctionService } from "../services/auction.service";
import { IAuctionAttributesIdsSchema, IAuctionDetails, ICreateAuction } from "../types/auction.types";
import { ApiResponse } from "../utils/apiResponse";
import { RoleHelper } from "../helpers/roles.helpers";
import { NotificationService } from "../services/notification.service";
import { NotificationMessage, NOTIFICATIONS, NotificationType } from "../constants/notification.constants";
import { AuctionsHelper } from "../helpers/auctions.helpers";
import { FileService } from "../services/file.service";
import { toMySQLDate } from "../utils/common";
import { RoleService } from "../services/role.service";
import { ROLES } from "../constants/roles.constants";

const fileService = new FileService();

export class AuctionController {
  static upsetAuction = async (req: Request, res: Response) => {
    try {
      const data: ICreateAuction = req.body;
      data.startDate = toMySQLDate(data.startDate);
      let playerId: number;
      if (!data.auctionId) {
        playerId = req.userId;
        data.playerId = playerId;
        const isFreeLimitReached = await AuctionService.isAuctionInPendingState(playerId);
        if (isFreeLimitReached) {
          return ApiResponse.error(res, "Access Denied", 200, { isFreeLimitReached: true });
        }
      } else {
        const auctionInfo = await AuctionService.getAuctionPlayerId(data.auctionId);
        if (!auctionInfo?.playerId) {
          return ApiResponse.error(res, "Auction Not Found", 200, { isNotFound: true });
        }
        playerId = auctionInfo.playerId;
        data.playerId = auctionInfo.playerId;
        if (!RoleHelper.isAdminAndAbove(req.role) && auctionInfo.playerId !== req.userId) {
          return ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
        }
      }
      const newAuctionId = await AuctionService.upsetAuction(data);
      if (newAuctionId) {
        if (data.auctionId) {
          NotificationService.createNotification(
            playerId,
            playerId === req.userId
              ? NotificationMessage.AUCTION_UPDATE_BY_SELF
              : NotificationMessage.AUCTION_UPDATE_BY_ELSE,
            NOTIFICATIONS.AUCTION_UPDATED as NotificationType,
            req.userId,
            req.role,
            AuctionsHelper.getNotificationJSON(data.name, data.state)
          );
        } else {
          const code = AuctionsHelper.generateAuctionCode(newAuctionId, req.name, req.role);
          await AuctionService.updateAuctionCode(code, newAuctionId);
          NotificationService.createNotification(
            playerId,
            NotificationMessage.AUCTION_CREATE_BY_SELF,
            NOTIFICATIONS.AUCTION_CREATED as NotificationType,
            req.userId,
            req.role,
            AuctionsHelper.getNotificationJSON(data.name, data.state, code)
          );
        }

        return ApiResponse.success(
          res,
          {},
          200,
          data.auctionId ? "Auction updated successfully!!" : "Auction created successfully!!"
        );
      }
      return ApiResponse.error(res, "Something went happen. Please try again.", 200, { isError: true });
    } catch (error) {
      console.log(error);
      return ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static getAuctions = async (req: Request, res: Response) => {
    try {
      let auctionResponse = await AuctionService.getAuctions(req.userId);
      if (auctionResponse) {
        auctionResponse = await this.updateFilePaths(auctionResponse);
        ApiResponse.success(res, auctionResponse, 200, "User auctions retrieve successfully!!");
      } else {
        ApiResponse.success(res, [], 200, "Something went happen. Please try again.");
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static deleteAuction = async (req: Request, res: Response) => {
    try {
      const auctionId = parseInt(req.params.auctionId);
      const auctionResponse = await AuctionService.deleteAuctionById(
        auctionId || 0,
        req.userId,
        RoleHelper.isAdminAndAbove(req.role)
      );
      if (auctionResponse) {
        const response: any = {};
        if (auctionResponse.status && auctionResponse.playerId) {
          if (auctionResponse.imagePath) {
            await fileService.deleteUploadedFile(auctionResponse.imagePath);
          }
          if (auctionResponse.qrCodePath) {
            await fileService.deleteUploadedFile(auctionResponse.qrCodePath);
          }

          if (RoleHelper.isOrganiser(req.role)) {
            const isOrganiser = AuctionService.isOrganiser(auctionResponse.playerId);

            if (!isOrganiser) {
              const roleResult = await RoleService.deleteRole(auctionResponse.playerId);
              if (roleResult) {
                NotificationService.createNotification(
                  auctionResponse.playerId,
                  NotificationMessage.REMOVE_ROLE_FROM_ORGANISER,
                  NOTIFICATIONS.ROLE_UPDATED as NotificationType,
                  auctionResponse.playerId,
                  ROLES.PLAYER
                );
                response.isNoAuctionAvailable = true;
              }
            }
          }

          NotificationService.createNotification(
            auctionResponse.playerId,
            auctionResponse.playerId === req.userId
              ? NotificationMessage.AUCTION_DELETED_BY_SELF
              : NotificationMessage.AUCTION_DELETED_BY_ELSE,
            NOTIFICATIONS.AUCTION_DELETED as NotificationType,
            req.userId,
            req.role,
            AuctionsHelper.getNotificationJSON(
              auctionResponse.name || "",
              auctionResponse.state || "",
              auctionResponse.code || ""
            )
          );
        }

        if (auctionResponse.status !== undefined) response.status = auctionResponse.status;
        if (auctionResponse.isAccessDenied !== undefined) response.isAccessDenied = auctionResponse.isAccessDenied;
        if (auctionResponse.isNotFound !== undefined) response.isNotFound = auctionResponse.isNotFound;
        if (auctionResponse.isLocked !== undefined) response.isLocked = auctionResponse.isLocked;

        ApiResponse.success(res, response, 200, "Auction Details!!");
      } else {
        ApiResponse.error(res, "Unable to delete Auction. Please try again", 200, { isError: true });
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static approveAuction = async (req: Request, res: Response) => {
    try {
      const auctionId = parseInt(req.params.auctionId);
      let auctionResponse = await AuctionService.approveAuction(auctionId);
      if (auctionResponse) {
        const auctionInfo = await AuctionService.getAuctionName(auctionId);
        if (auctionInfo?.playerId) {
          const roleResult = await RoleService.createOrganiser(auctionInfo?.playerId);
          if (roleResult) {
            NotificationService.createNotification(
              auctionInfo.playerId,
              NotificationMessage.CHANGE_ROLE_TO_ORGANISER,
              NOTIFICATIONS.ROLE_UPDATED as NotificationType,
              req.userId,
              req.role
            );
          }
        }
        NotificationService.createNotification(
          auctionInfo?.playerId || req.userId,
          NotificationMessage.AUCTION_APPROVED_BY_ELSE,
          NOTIFICATIONS.AUCTION_APPROVED as NotificationType,
          req.userId,
          req.role,
          AuctionsHelper.getNotificationJSON(auctionInfo?.name || "", auctionInfo?.state || "", auctionInfo?.code || "")
        );
        ApiResponse.success(res, {}, 200, "User auctions retrieve successfully!!");
      } else {
        ApiResponse.error(res, "Something went happen. Please try again.", 200, { isError: true });
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static getAuctionBySearch = async (req: Request, res: Response) => {
    try {
      const data = req.query as unknown as IAuctionAttributesIdsSchema;
      let auctionResponse = await AuctionService.getAuctionDetailsbySearch(data.searchText || "");
      if (auctionResponse) {
        auctionResponse = await this.updateFilePaths(auctionResponse);
        ApiResponse.success(res, auctionResponse, 200, "Auction Details!!");
      } else {
        ApiResponse.error(res, "Unable to retrieve Auction. Please try again", 200, { isError: true });
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static getAuctionById = async (req: Request, res: Response) => {
    try {
      const auctionId = parseInt(req.params.auctionId);
      if (!RoleHelper.isAdminAndAbove(req.role)) {
        const isValidAuction = await AuctionService.isValidAuctionForAccess(auctionId, req.userId);
        if (!isValidAuction) {
          return ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
        }
      }
      let auctionResponse = await AuctionService.getAuctionDetails(auctionId);
      if (auctionResponse) {
        auctionResponse = await this.updateFilePath(auctionResponse);
        ApiResponse.success(res, auctionResponse, 200, "Auction Details!!");
      } else {
        ApiResponse.error(res, "Unable to retrieve Auction. Please try again", 200, { isError: true });
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  private static updateFilePaths = async (auctionResponse: IAuctionDetails[]) => {
    if (auctionResponse.length > 0) {
      const imageIds = [...new Set(auctionResponse.map((a) => a.imageId))].filter((id): id is number => id !== null);
      if (imageIds.length > 0) {
        const files = await fileService.getFiles(imageIds);
        if (files) {
          const fileMap = new Map<number, string>();
          files.forEach((file) => fileMap.set(file.fileId, file.path));
          return auctionResponse.map((auction) => ({
            ...auction,
            imagePath: auction.imageId !== null ? fileMap.get(auction.imageId) || "" : "",
          }));
        }
      }
    }
    return auctionResponse;
  };

  private static updateFilePath = async (auctionResponse: IAuctionDetails) => {
    if (auctionResponse.imageId) {
      const imageIds = [auctionResponse.imageId];
      const files = await fileService.getFiles(imageIds);
      if (files?.length === 1) {
        auctionResponse.imagePath = files[0].path;
      }
    }

    if (auctionResponse.qrCodeId) {
      const imageIds = [auctionResponse.qrCodeId];
      const files = await fileService.getFiles(imageIds);
      if (files?.length === 1) {
        auctionResponse.qrCodePath = files[0].path;
      }
    }

    return auctionResponse;
  };
}
