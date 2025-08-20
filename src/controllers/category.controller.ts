import { Request, Response } from "express";
import { AuctionService } from "../services/auction.service";
import { ICreateCategory, IManageAuction, IManageAuctionOperation } from "../types/auction.types";
import { ApiResponse } from "../utils/apiResponse";
import { RoleHelper } from "../helpers/roles.helpers";
import { NotificationService } from "../services/notification.service";
import { NotificationMessage, NOTIFICATIONS, NotificationType } from "../constants/notification.constants";
import { AuctionsHelper } from "../helpers/auctions.helpers";

export class CategoryController {
  static upsetCategory = async (req: Request, res: Response) => {
    try {
      const data: ICreateCategory = req.body;
      const auctionId = parseInt(req.params.auctionId);
      data.auctionId = auctionId;

      const auctionPlayerId = await AuctionService.isValidAuctionPlayerIdForEdit(data.auctionId);
      if (!auctionPlayerId) {
        return ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
      }
      if (!RoleHelper.isAdminAndAbove(req.role)) {
        if (auctionPlayerId !== req.userId) {
          return ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
        }
      }

      const newCategoryId = await AuctionService.upsetCategory(data);
      if (newCategoryId) {
        if (data.categoryId) {
          NotificationService.createNotification(
            auctionPlayerId,
            auctionPlayerId === req.userId
              ? NotificationMessage.CATEGORY_UPDATE_BY_SELF
              : NotificationMessage.CATEGORY_UPDATE_BY_ELSE,
            NOTIFICATIONS.CATEGORY_UPDATED as NotificationType,
            req.userId,
            req.role,
            AuctionsHelper.getNotificationJSON(data.name)
          );
        } else {
          NotificationService.createNotification(
            auctionPlayerId,
            NotificationMessage.CATEGORY_CREATE_BY_SELF,
            NOTIFICATIONS.CATEGORY_CREATED as NotificationType,
            req.userId,
            req.role,
            AuctionsHelper.getNotificationJSON(data.name)
          );
        }

        return ApiResponse.success(
          res,
          {},
          200,
          data.categoryId ? "Category updated successfully!!" : "Category created successfully!!"
        );
      }
      return ApiResponse.error(res, "Something went happen. Please try again.", 200, { isError: true });
    } catch (error) {
      console.log(error);
      return ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static getCategoryByAuction = async (req: Request, res: Response) => {
    try {
      const auctionId = parseInt(req.params.auctionId);
      if (!RoleHelper.isAdminAndAbove(req.role)) {
        const isAuctionValid = await AuctionService.isValidAuctionForAccess(auctionId, req.userId);
        if (!isAuctionValid) {
          return ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
        }
      }
      let auctionResponse = await AuctionService.getCategoriesByAuctionId(auctionId);
      if (auctionResponse) {
        ApiResponse.success(res, auctionResponse, 200, "Auction Category retrieve successfully!!");
      } else {
        ApiResponse.success(res, [], 200, "Something went happen. Please try again.");
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static deleteCategory = async (req: Request, res: Response) => {
    try {
      console.error('yes');
      const auctionId = parseInt(req.params.auctionId);
      const categoryId = parseInt(req.params.categoryId);
      const categoryResponse = await AuctionService.deleteCategoryById(
        categoryId,
        RoleHelper.isAdminAndAbove(req.role),
        req.userId,
        auctionId
      );
      if (categoryResponse) {
        const response: any = {};
        if (categoryResponse.status) {
          if (RoleHelper.isOrganiser(req.role)) {
            NotificationService.createNotification(
              categoryResponse.playerId || req.userId,
              categoryResponse.playerId === req.userId
                ? NotificationMessage.CATEGORY_DELETED_BY_SELF
                : NotificationMessage.CATEGORY_DELETED_BY_ELSE,
              NOTIFICATIONS.CATEGORY_DELETED as NotificationType,
              req.userId,
              req.role,
              AuctionsHelper.getNotificationJSON(categoryResponse.name || "")
            );
          }

          if (categoryResponse.isNotFound !== undefined) response.isNotFound = categoryResponse.isNotFound;
          if (categoryResponse.status !== undefined) response.status = categoryResponse.status;
          if (categoryResponse.isAccessDenied !== undefined) response.isAccessDenied = categoryResponse.isAccessDenied;
          if (categoryResponse.isLive !== undefined) response.isLive = categoryResponse.isLive;
          if (categoryResponse.isError !== undefined) response.isError = categoryResponse.isError;

          ApiResponse.success(res, response, 200, "Catergory Deleted!!");
        } else {
          ApiResponse.error(res, "Unable to delete Category. Please try again", 200, { isError: true });
        }
      }
      ApiResponse.error(res, "Something went happen. Please try again.", 200, { isError: true });
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static getcategoryById = async (req: Request, res: Response) => {
    try {
      const auctionId = parseInt(req.params.auctionId);
      const categoryId = parseInt(req.params.categoryId);
      if (!RoleHelper.isAdminAndAbove(req.role)) {
        const isAuctionValid = await AuctionService.isValidAuctionForAccess(auctionId, req.userId);
        if (!isAuctionValid) {
          return ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
        }
      }
      let auctionResponse = await AuctionService.getCategoryById(auctionId, categoryId);
      if (auctionResponse) {
        ApiResponse.success(res, auctionResponse, 200, "Category Details!!");
      } else {
        ApiResponse.error(res, "Unable to retrieve Category. Please try again", 200, { isNotFound: true });
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static addPlayerToCategory = async (req: Request, res: Response) => {
    try {
      const data: IManageAuction = {
        ...req.body,
        operation: "ASSIGN_CATEGORY" as IManageAuctionOperation,
      };
      const response = await AuctionService.updatePlayerToAuction(data);
      if (response) {
        const categoryResponse: any = {};
        if (response.status) {
          data.playerIds.forEach((id) => {
            if (id !== response.playerId) {
              if (id === req.userId) {
                NotificationService.createNotification(
                  response.playerId || req.userId,
                  NotificationMessage.PLAYER_ADDED_TO_CATEGORY_BY_SELF,
                  NOTIFICATIONS.PLAYER_ADDED as NotificationType,
                  req.userId,
                  req.role,
                  AuctionsHelper.getNotificationJSON(response.name || "", undefined, undefined, response.categoryName)
                );
              } else if (req.userId === response.playerId || RoleHelper.isAdminAndAbove(req.role)) {
                NotificationService.createNotification(
                  id,
                  NotificationMessage.PLAYER_ADDED_TO_CATEGORY_BY_ELSE,
                  NOTIFICATIONS.PLAYER_ADDED as NotificationType,
                  req.userId,
                  req.role,
                  AuctionsHelper.getNotificationJSON(response.name || "", undefined, undefined, response.categoryName)
                );
              }
            }
          });

          if (response.isNotFound !== undefined) categoryResponse.isNotFound = response.isNotFound;
          if (response.status !== undefined) categoryResponse.status = response.status;
          if (response.isAccessDenied !== undefined) categoryResponse.isAccessDenied = response.isAccessDenied;
          if (response.isLive !== undefined) categoryResponse.isLive = response.isLive;
          if (response.isError !== undefined) categoryResponse.isError = response.isError;

          ApiResponse.success(res, categoryResponse, 200, "Successfully added to Category!!");
        } else {
          ApiResponse.error(res, "Unable to add to category. Please try again", 200, { isError: true });
        }
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static removePlayerFromCategory = async (req: Request, res: Response) => {
    try {
      const data: IManageAuction = {
        ...req.body,
        operation: "REMOVE_CATEGORY" as IManageAuctionOperation,
      };
      const response = await AuctionService.updatePlayerToAuction(data);
      if (response) {
        const categoryResponse: any = {};
        if (response.status) {
          data.playerIds.forEach((id) => {
            if (id !== response.playerId) {
              if (id === req.userId) {
                NotificationService.createNotification(
                  response.playerId || req.userId,
                  NotificationMessage.PLAYER_REMOVED_FROM_CATEGORY_BY_SELF,
                  NOTIFICATIONS.PLAYER_REMOVED as NotificationType,
                  req.userId,
                  req.role,
                  AuctionsHelper.getNotificationJSON(response.name || "", undefined, undefined, response.categoryName)
                );
              } else if (req.userId === response.playerId || RoleHelper.isAdminAndAbove(req.role)) {
                NotificationService.createNotification(
                  id,
                  NotificationMessage.PLAYER_REMOVED_FROM_CATEGORY_BY_ELSE,
                  NOTIFICATIONS.PLAYER_REMOVED as NotificationType,
                  req.userId,
                  req.role,
                  AuctionsHelper.getNotificationJSON(response.name || "", undefined, undefined, response.categoryName)
                );
              }
            }
          });

          if (response.isNotFound !== undefined) categoryResponse.isNotFound = response.isNotFound;
          if (response.status !== undefined) categoryResponse.status = response.status;
          if (response.isAccessDenied !== undefined) categoryResponse.isAccessDenied = response.isAccessDenied;
          if (response.isLive !== undefined) categoryResponse.isLive = response.isLive;
          if (response.isError !== undefined) categoryResponse.isError = response.isError;

          ApiResponse.success(res, categoryResponse, 200, "Successfully removed from Category!!");
        } else {
          ApiResponse.error(res, "Unable to remove from category. Please try again", 200, { isError: true });
        }
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };
}
