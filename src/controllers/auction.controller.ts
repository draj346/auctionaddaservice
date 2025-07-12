import { Request, Response } from "express";
import { AuctionService } from "../services/auction.service";
import { IAuctionAttributesIdsSchema, IAuctionDetails, ICreateAuction } from "../types/auction.types";
import { ApiResponse } from "../utils/apiResponse";
import { RoleHelper } from "../helpers/roles.helpers";
import { NotificationService } from "../services/notification.service";
import { NotificationMessage, NOTIFICATIONS, NotificationType } from "../constants/notification.constants";
import { AuctionsHelper } from "../helpers/auctions.helpers";
import { FileService } from "../services/file.service";

const fileService = new FileService();

export class AuctionController {
  static upsetAuction = async (req: Request, res: Response) => {
    try {
      const data: ICreateAuction = req.body;
      let playerId: number;
      if (!data.auctionId) {
        playerId = req.userId;
        data.playerId = playerId;
        data.code = AuctionsHelper.generateAuctionCode(playerId, req.name, req.role);
        const isFreeLimitReached = await AuctionService.isAuctionInPendingState(playerId);
        if (isFreeLimitReached) {
          return ApiResponse.error(res, "Access Denied", 200, { isFreeLimitReached: true });
        }
      } else {
        const auctionPlayerId = await AuctionService.getAuctionPlayerId(data.auctionId);
        if (!auctionPlayerId) {
          return ApiResponse.error(res, "Auction Not Found", 200, { isNotFound: true });
        }
        playerId = auctionPlayerId;
        if (!RoleHelper.isAdminAndAbove(req.role) || auctionPlayerId !== req.userId) {
          return ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
        }
      }
      const auctionResponse = await AuctionService.upsetAuction(data);
      if (auctionResponse) {
        if (data.auctionId) {
          NotificationService.createNotification(
            playerId,
            playerId === req.userId
              ? NotificationMessage.AUCTION_UPDATE_BY_SELF
              : NotificationMessage.AUCTION_UPDATE_BY_ELSE,
            NOTIFICATIONS.AUCTION_UPDATED as NotificationType,
            req.userId,
            req.role
          );
        } else {
          NotificationService.createNotification(
            playerId,
            NotificationMessage.AUCTION_CREATE_BY_SELF,
            NOTIFICATIONS.AUCTION_CREATED as NotificationType,
            req.userId,
            req.role
          );
        }

        ApiResponse.success(
          res,
          {},
          200,
          data.auctionId ? "Auction updated successfully!!" : "Auction created successfully!!"
        );
      }
      ApiResponse.error(res, "Something went happen. Please try again.", 200, { isError: true });
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  private static updateFilePath = async (auctionResponse: IAuctionDetails[]) => {
    if (auctionResponse.length > 0) {
      const imageIds = [...new Set(auctionResponse.map((a) => a.imageId))];
      const files = await fileService.getFiles(imageIds);
      if (files) {
        const fileMap = new Map<number, string>();
        files.forEach((file) => fileMap.set(file.fileId, file.path));
        return auctionResponse.map((auction) => ({
          ...auction,
          path: fileMap.get(auction.imageId) || "",
        }));
      }
    }
    return auctionResponse;
  };

  static getAuctions = async (req: Request, res: Response) => {
    try {
      let auctionResponse = await AuctionService.getAuctions(req.userId);
      if (auctionResponse) {
        auctionResponse = await this.updateFilePath(auctionResponse);
        ApiResponse.success(res, auctionResponse, 200, "User auctions retireve successfully!!");
      } else {
        ApiResponse.error(res, "Something went happen. Please try again.", 200, { isError: true });
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static deleteAuction = async (req: Request, res: Response) => {
    try {
      const data: IAuctionAttributesIdsSchema = req.body;
      const auctionResponse = await AuctionService.deleteAuctionById(
        data.auctionId || 0,
        req.userId,
        RoleHelper.isAdminAndAbove(req.role)
      );
      if (auctionResponse) {
        ApiResponse.success(res, auctionResponse, 200, "Auction Details!!");
      } else {
        ApiResponse.error(res, "Unable to delete Auction. Please try again", 200, { isError: true });
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static getAuctionBySearch = async (req: Request, res: Response) => {
    try {
      const data: IAuctionAttributesIdsSchema = req.body;
      let auctionResponse = await AuctionService.getAuctionDetailsbySearch(data.searchText || "");
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
}
