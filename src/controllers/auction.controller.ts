import { Request, Response } from "express";
import { AuctionService } from "../services/auction.service";
import {
  AuctionPlayer,
  AuctionTeamSummaryData,
  GenerateTeamPDFProps,
  IApprovePlayerForAuction,
  IAuctionAttributesIdsSchema,
  IAuctionDetails,
  ICreateAuction,
  IManageAuction,
  IManageAuctionOperation,
  IResetAuctionPlayers,
} from "../types/auction.types";
import { ApiResponse } from "../utils/apiResponse";
import { RoleHelper } from "../helpers/roles.helpers";
import { NotificationService } from "../services/notification.service";
import { NotificationMessage, NOTIFICATIONS, NotificationType } from "../constants/notification.constants";
import { AuctionsHelper } from "../helpers/auctions.helpers";
import { FileService } from "../services/file.service";
import { DuplicateFile, getFormattedAmount, toMySQLDate } from "../utils/common";
import { RoleService } from "../services/role.service";
import { ROLES } from "../constants/roles.constants";
import { FILE_UPLOAD_FOLDER, FREE_TEAM_CREATE_LIMIT } from "../config/env";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import generateTeamPDF from "../utils/generatePdf";

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
        if (!RoleHelper.isAdminAndAbove(req.role)) {
          const isFreeLimitReached = await AuctionService.isAuctionInPendingState(playerId);
          if (isFreeLimitReached) {
            return ApiResponse.error(res, "Access Denied", 200, { isFreeLimitReached: true });
          }
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

  static getUpcomingAuctions = async (req: Request, res: Response) => {
    try {
      let auctionResponse = await AuctionService.getUpcomingAuctions();
      if (auctionResponse) {
        auctionResponse = await this.updateFilePaths(auctionResponse);
        ApiResponse.success(res, auctionResponse, 200, "Auctions retrieve successfully!!");
      } else {
        ApiResponse.success(res, [], 200, "Something went happen. Please try again.");
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static getLiveAuctions = async (req: Request, res: Response) => {
    try {
      let auctionResponse = await AuctionService.getLiveAuctions();
      if (auctionResponse) {
        auctionResponse = await this.updateFilePaths(auctionResponse);
        ApiResponse.success(res, auctionResponse, 200, "Auctions retrieve successfully!!");
      } else {
        ApiResponse.success(res, [], 200, "Something went happen. Please try again.");
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static getAuctionsForCopy = async (req: Request, res: Response) => {
    try {
      if (!RoleHelper.isAdminAndAbove(req.role)) {
        const isFreeLimitReached = await AuctionService.isAuctionInPendingState(req.userId);
        if (isFreeLimitReached) {
          return ApiResponse.error(res, "Access Denied", 200, { isFreeLimitReached: true });
        }
      }
      const auctionResponse = await AuctionService.getAuctionsForCopy(req.userId, req.role);
      ApiResponse.success(res, auctionResponse, 200, "Auctions retrieve successfully!!");
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static getAuctionPlayers = async (req: Request, res: Response) => {
    try {
      const auctionId = parseInt(req.params.auctionId);
      const auctionResponse = await AuctionService.getAuctionPlayers(auctionId);
      if (auctionResponse) {
        ApiResponse.success(res, auctionResponse, 200, "Players retrieve successfully!!");
      } else {
        ApiResponse.error(res, "Something went happen. Please try again.", 200, { isNotFound: true });
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static getAuctionInfo = async (req: Request, res: Response) => {
    try {
      const auctionId = parseInt(req.params.auctionId);
      const auctionResponse = await AuctionService.getAuctionInfo(auctionId);
      if (auctionResponse) {
        ApiResponse.success(res, auctionResponse, 200, "Auctions retrieve successfully!!");
      } else {
        ApiResponse.error(res, "Something went happen. Please try again.", 200, { isNotFound: true });
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static copyAuction = async (req: Request, res: Response) => {
    try {
      const auctionId = parseInt(req.params.auctionId);
      const isAdmin = RoleHelper.isAdminAndAbove(req.role);
      if (!isAdmin) {
        const isFreeLimitReached = await AuctionService.isAuctionInPendingState(req.userId);
        if (isFreeLimitReached) {
          return ApiResponse.error(res, "Access Denied", 200, { isFreeLimitReached: true });
        }
      }
      const auctionResponse = await AuctionService.copyAuctionById(
        auctionId,
        req.userId,
        isAdmin,
        FREE_TEAM_CREATE_LIMIT
      );
      if (auctionResponse) {
        const response: any = {};
        if (auctionResponse?.status && auctionResponse.auctionId) {
          const code = AuctionsHelper.generateAuctionCode(auctionResponse.auctionId, req.name, req.role);
          await AuctionService.updateAuctionCode(code, auctionResponse.auctionId);

          if (auctionResponse.imageId && auctionResponse.imagePath) {
            const fileResponse = await DuplicateFile(auctionResponse.imagePath);
            if (fileResponse.name) {
              const url = `${FILE_UPLOAD_FOLDER}${fileResponse.name}`;
              fileService.updateFileOnly({
                name: fileResponse.name,
                path: fileResponse.path,
                url,
                fileId: auctionResponse.imageId,
              });
            }
          }

          if (auctionResponse.qrCodeId && auctionResponse.qrCodePath) {
            const qrCodeResponse = await DuplicateFile(auctionResponse.qrCodePath);
            if (qrCodeResponse.name) {
              const url = `${FILE_UPLOAD_FOLDER}${qrCodeResponse.name}`;
              fileService.updateFileOnly({
                name: qrCodeResponse.name,
                path: qrCodeResponse.path,
                url,
                fileId: auctionResponse.qrCodeId,
              });
            }
          }

          NotificationService.createNotification(
            auctionResponse?.playerId || req.userId,
            auctionResponse.playerId === req.userId
              ? NotificationMessage.AUCTION_COPY_BY_SELF
              : NotificationMessage.AUCTION_COPY_BY_ELSE,
            NOTIFICATIONS.AUCTION_CREATED as NotificationType,
            req.userId,
            req.role,
            AuctionsHelper.getNotificationJSON(auctionResponse.name || "", auctionResponse.state || "", code || "")
          );
          ApiResponse.success(res, {}, 200, "Copy Auctions result!!");
        } else {
          if (auctionResponse.status !== undefined) response.status = auctionResponse.status;
          if (auctionResponse.isAccessDenied !== undefined) response.isAccessDenied = auctionResponse.isAccessDenied;
          if (auctionResponse.isError !== undefined) response.isError = auctionResponse.isError;

          ApiResponse.error(res, "Copy Auctions result!!", 200, response);
        }
      } else {
        ApiResponse.error(res, "Unable to copy Auction. Please try again", 200, { isError: true });
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

  static updateAuctionCompletionStatus = async (req: Request, res: Response) => {
    try {
      const auctionId = parseInt(req.params.auctionId);
      let auctionResponse = await AuctionService.updateAuctionCompletionStatus(auctionId);
      if (auctionResponse) {
        const auctionInfo = await AuctionService.getAuctionName(auctionId);
        NotificationService.createNotification(
          auctionInfo?.playerId || req.userId,
          NotificationMessage.AUCTION_COMPLETED,
          NOTIFICATIONS.AUCTION_UPDATED as NotificationType,
          req.userId,
          req.role,
          AuctionsHelper.getNotificationJSON(auctionInfo?.name || "", auctionInfo?.state || "", auctionInfo?.code || "")
        );
        ApiResponse.success(res, {}, 200, "auctions completed successfully!!");
      } else {
        ApiResponse.error(res, "Something went happen. Please try again.", 200, { isError: true });
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
        if (auctionInfo?.playerId && !RoleHelper.isOrganiserAndAbove(req.role)) {
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

  static approvePlayerForAuction = async (req: Request, res: Response) => {
    try {
      const data: IApprovePlayerForAuction = req.body;
      const auctionInfo = await AuctionService.getAuctionPlayerId(data.auctionId);
      if (!auctionInfo) {
        return ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
      }

      if (!RoleHelper.isAdminAndAbove(req.role)) {
        if (auctionInfo.playerId !== req.userId) {
          return ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
        }
      }

      const response = await AuctionService.approvePlayerToAuction(data);
      if (response) {
        data.playerIds.forEach((id: number) => {
          NotificationService.createNotification(
            id,
            NotificationMessage.PLAYER_APPROVED_FOR_AUCTION,
            NOTIFICATIONS.PLAYER_AUCTION_APPROVED as NotificationType,
            req.userId,
            req.role,
            AuctionsHelper.getNotificationJSON(auctionInfo.name, undefined, auctionInfo.code)
          );
        });
        ApiResponse.success(res, {}, 200, "Player Approved for Auctions successfully!!");
      } else {
        ApiResponse.error(res, "Unable to approved player for auction. Please try again", 200, { isError: true });
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static starPlayerForAuction = async (req: Request, res: Response) => {
    try {
      const data: IApprovePlayerForAuction = req.body;
      const response = await AuctionService.starPlayerForAuction(data);
      if (response) {
        ApiResponse.success(res, {}, 200, "Player updated successfully!!");
      } else {
        ApiResponse.error(res, "Something went happen. Please try again", 200, { isError: true });
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static unStarPlayerForAuction = async (req: Request, res: Response) => {
    try {
      const data: IApprovePlayerForAuction = req.body;
      const response = await AuctionService.unStarPlayerForAuction(data);
      if (response) {
        ApiResponse.success(res, {}, 200, "Player updated successfully!!");
      } else {
        ApiResponse.error(res, "Something went happen. Please try again", 200, { isError: true });
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static updatePlayerAuctionStatus = async (req: Request, res: Response) => {
    try {
      const auctionId = parseInt(req.params.auctionId);
      const playerId = parseInt(req.params.playerId);
      const status = req.params.status;
      const response = await AuctionService.updatePlayerAuctionStatus(status.toUpperCase(), auctionId, playerId);
      if (response) {
        ApiResponse.success(res, {}, 200, "Player status updated successfully!!");
      } else {
        ApiResponse.error(res, "Something went happen. Please try again", 200, { isError: true });
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

  static addPlayerToAuction = async (req: Request, res: Response) => {
    try {
      const data: IManageAuction = {
        ...req.body,
        operation: "ASSIGN_AUCTION" as IManageAuctionOperation,
      };
      if (!RoleHelper.isAdminAndAbove(req.role)) {
        const isValidAuction = await AuctionService.isValidAuctionForAccess(data.auctionId, req.userId);
        if (!isValidAuction) {
          return ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
        }
      }
      const response = await AuctionService.updatePlayerToAuction(data);
      if (response) {
        const categoryResponse: any = {};
        if (response.status) {
          data.playerIds.forEach((id) => {
            if (id !== response.playerId) {
              if (id === req.userId) {
                NotificationService.createNotification(
                  response.playerId || req.userId,
                  NotificationMessage.PLAYER_ADDED_TO_AUCTION_BY_SELF,
                  NOTIFICATIONS.PLAYER_ADDED as NotificationType,
                  req.userId,
                  req.role,
                  AuctionsHelper.getNotificationJSON(response.name || "")
                );
              } else if (req.userId === response.playerId || RoleHelper.isAdminAndAbove(req.role)) {
                NotificationService.createNotification(
                  id,
                  NotificationMessage.PLAYER_ADDED_TO_AUCTION_BY_ELSE,
                  NOTIFICATIONS.PLAYER_ADDED as NotificationType,
                  req.userId,
                  req.role,
                  AuctionsHelper.getNotificationJSON(response.name || "")
                );
              }
            }
          });

          if (response.isNotFound !== undefined) categoryResponse.isNotFound = response.isNotFound;
          if (response.status !== undefined) categoryResponse.status = response.status;
          if (response.isAccessDenied !== undefined) categoryResponse.isAccessDenied = response.isAccessDenied;
          if (response.isLive !== undefined) categoryResponse.isLive = response.isLive;
          if (response.isError !== undefined) categoryResponse.isError = response.isError;

          ApiResponse.success(res, categoryResponse, 200, "Successfully added to Auction!!");
        } else {
          ApiResponse.error(res, "Unable to add to auction. Please try again", 200, { isError: true });
        }
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static joinPlayerToAuction = async (req: Request, res: Response) => {
    try {
      const data: IManageAuction = {
        ...req.body,
        operation: "ASSIGN_SELF" as IManageAuctionOperation,
        playerIds: [req.userId],
      };
      const playerId = await AuctionService.isValidAuctionPlayerIdForEdit(data.auctionId);
      if (!playerId) {
        return ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
      }

      const response = await AuctionService.updatePlayerToAuction(data);
      if (response) {
        const auctionResponse: any = {};
        if (response.status) {
          NotificationService.createNotification(
            playerId,
            NotificationMessage.PLAYER_JOINED_AUCTION,
            NOTIFICATIONS.PLAYER_JOINED as NotificationType,
            req.userId,
            req.role,
            AuctionsHelper.getNotificationJSON(response.name || "", "", "", "", req.name)
          );

          if (response.isNotFound !== undefined) auctionResponse.isNotFound = response.isNotFound;
          if (response.status !== undefined) auctionResponse.status = response.status;
          if (response.isAccessDenied !== undefined) auctionResponse.isAccessDenied = response.isAccessDenied;
          if (response.isLive !== undefined) auctionResponse.isLive = response.isLive;
          if (response.isError !== undefined) auctionResponse.isError = response.isError;

          ApiResponse.success(res, auctionResponse, 200, "Successfully added to Auction!!");
        } else {
          ApiResponse.error(res, "Unable to add to auction. Please try again", 200, { isError: true });
        }
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static removeSelfFromAuction = async (req: Request, res: Response) => {
    try {
      const auctionId = parseInt(req.params.auctionId);
      const data = {
        auctionId,
        operation: "REMOVE_AUCTION" as IManageAuctionOperation,
        playerIds: [req.userId],
      };
      const playerId = await AuctionService.isValidAuctionPlayerIdForEdit(data.auctionId);
      if (!playerId) {
        return ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
      }

      const response = await AuctionService.updatePlayerToAuction(data as unknown as IManageAuction);
      if (response) {
        const auctionResponse: any = {};
        if (response.status) {
          NotificationService.createNotification(
            playerId,
            NotificationMessage.PLAYER_REMOVED_SELF_AUCTION,
            NOTIFICATIONS.PLAYER_EXIT as NotificationType,
            req.userId,
            req.role,
            AuctionsHelper.getNotificationJSON(response.name || "", "", "", "", req.name)
          );

          if (response.isNotFound !== undefined) auctionResponse.isNotFound = response.isNotFound;
          if (response.status !== undefined) auctionResponse.status = response.status;
          if (response.isAccessDenied !== undefined) auctionResponse.isAccessDenied = response.isAccessDenied;
          if (response.isLive !== undefined) auctionResponse.isLive = response.isLive;
          if (response.isError !== undefined) auctionResponse.isError = response.isError;

          ApiResponse.success(res, auctionResponse, 200, "Successfully exited from Auction!!");
        } else {
          ApiResponse.error(res, "Unable to remove from auction. Please try again", 200, { isError: true });
        }
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static removePlayerFromAuction = async (req: Request, res: Response) => {
    try {
      const data: IManageAuction = {
        ...req.body,
        operation: "REMOVE_AUCTION" as IManageAuctionOperation,
      };
      const auctionInfo = await AuctionService.getAuctionPlayerId(data.auctionId);
      if (!auctionInfo) {
        return ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
      }

      if (!RoleHelper.isAdminAndAbove(req.role)) {
        if (auctionInfo.playerId !== req.userId) {
          return ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
        }
      }
      const response = await AuctionService.updatePlayerToAuction(data);
      if (response) {
        const categoryResponse: any = {};
        if (response.status) {
          data.playerIds.forEach((id) => {
            if (id !== response.playerId) {
              if (id === req.userId) {
                NotificationService.createNotification(
                  response.playerId || req.userId,
                  NotificationMessage.PLAYER_REMOVED_FROM_AUCTION_BY_SELF,
                  NOTIFICATIONS.PLAYER_REMOVED as NotificationType,
                  req.userId,
                  req.role,
                  AuctionsHelper.getNotificationJSON(response.name || "")
                );
              } else if (req.userId === response.playerId || RoleHelper.isAdminAndAbove(req.role)) {
                NotificationService.createNotification(
                  id,
                  NotificationMessage.PLAYER_REMOVED_FROM_AUCTION_BY_ELSE,
                  NOTIFICATIONS.PLAYER_REMOVED as NotificationType,
                  req.userId,
                  req.role,
                  AuctionsHelper.getNotificationJSON(response.name || "")
                );
              }
            }
          });

          if (response.isNotFound !== undefined) categoryResponse.isNotFound = response.isNotFound;
          if (response.status !== undefined) categoryResponse.status = response.status;
          if (response.isAccessDenied !== undefined) categoryResponse.isAccessDenied = response.isAccessDenied;
          if (response.isLive !== undefined) categoryResponse.isLive = response.isLive;
          if (response.isError !== undefined) categoryResponse.isError = response.isError;

          ApiResponse.success(res, categoryResponse, 200, "Successfully removed from Auction!!");
        } else {
          ApiResponse.error(res, "Unable to remove from auction. Please try again", 200, { isError: true });
        }
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static getPendingPlayerCountForAuction = async (req: Request, res: Response) => {
    try {
      const auctionId = parseInt(req.params.auctionId);
      if (!RoleHelper.isAdminAndAbove(req.role)) {
        const isValidAuction = await AuctionService.isValidAuctionForAccess(auctionId, req.userId);
        if (!isValidAuction) {
          return ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
        }
      }
      const response = await AuctionService.getPendingPlayerCountForAuction(auctionId);
      ApiResponse.success(res, { total: response }, 200, "Pending Players for Auction!!");
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

  static getAuctionByCodeForJoin = async (req: Request, res: Response) => {
    try {
      const data = req.query as unknown as IAuctionAttributesIdsSchema;
      let auctionResponse = await AuctionService.getAuctionDetailsByCode(data.code || "", req.userId);
      if (auctionResponse) {
        auctionResponse = await this.updateFilePath(auctionResponse);
        ApiResponse.success(res, auctionResponse, 200, "Auction Details!!");
      } else {
        ApiResponse.error(res, "Unable to retrieve Auction. Please try again", 200, { isNotFound: true });
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static getMyAuctions = async (req: Request, res: Response) => {
    try {
      let auctionResponse = await AuctionService.getMyAuctions(req.userId);
      if (auctionResponse) {
        ApiResponse.success(res, auctionResponse, 200, "Auction Details!!");
      } else {
        ApiResponse.error(res, "Unable to retrieve Auction. Please try again", 200, { isNotFound: true });
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static resetAuctionPlayers = async (req: Request, res: Response) => {
    try {
      const auctionId = parseInt(req.params.auctionId);
      const data: IResetAuctionPlayers = {
        auctionId,
        requesterId: req.userId,
        isAdmin: RoleHelper.isAdminAndAbove(req.role),
      };
      const response = await AuctionService.resetAuctionPlayers(data);
      if (response) {
        const statusResponse: any = {};
        if (response.status) {
          ApiResponse.success(res, null, 200, "Reset completed!!");
        } else {
          ApiResponse.error(res, "Unable to reset the auction. Please try again", 200, { ...response });
        }
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static reauctionUnsoldPlayer = async (req: Request, res: Response) => {
    try {
      const auctionId = parseInt(req.params.auctionId);
      const auctionInfo = await AuctionService.getLiveAuctionPlayerId(auctionId);
      if (!auctionInfo) {
        return ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
      }

      if (!RoleHelper.isAdminAndAbove(req.role)) {
        if (auctionInfo.playerId !== req.userId) {
          return ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
        }
      }
      const response = await AuctionService.reauctionUnsoldPlayer(auctionId);
      if (response) {
        ApiResponse.success(res, null, 200, "Successfully reset unsold player for Auction!!");
      } else {
        ApiResponse.error(res, "Unable to reset unsold player for Auction. Please try again", 200, { isError: true });
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static updatePlayerOrder = async (req: Request, res: Response) => {
    try {
      const auctionId = parseInt(req.params.auctionId);
      const type = req.params.type;
      const auctionInfo = await AuctionService.getLiveAuctionPlayerId(auctionId);
      if (!auctionInfo) {
        return ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
      }

      if (!RoleHelper.isAdminAndAbove(req.role)) {
        if (auctionInfo.playerId !== req.userId) {
          return ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
        }
      }
      const response = await AuctionService.updatePlayerOrder(auctionId, type);
      if (response) {
        ApiResponse.success(res, null, 200, "Successfully updated Auction type!!");
      } else {
        ApiResponse.error(res, "Something went happen. Please try again", 200, { isError: true });
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static updateLiveAuctionMode = async (req: Request, res: Response) => {
    try {
      const auctionId = parseInt(req.params.auctionId);
      const auctionInfo = await AuctionService.getAuctionPlayerId(auctionId);
      if (!auctionInfo) {
        return ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
      }

      if (!RoleHelper.isAdminAndAbove(req.role)) {
        if (auctionInfo.playerId !== req.userId) {
          return ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
        }
      }
      const response = await AuctionService.updateLiveAuctionMode(auctionId);
      if (response) {
        ApiResponse.success(res, null, 200, "Successfully updated Auction Mode!!");
      } else {
        ApiResponse.error(res, "Something went happen. Please try again", 200, { isError: true });
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static generateAuctionReportByTeam = async (req: Request, res: Response) => {
    try {
      const auctionId = parseInt(req.params.auctionId);
      const teamId = parseInt(req.params.teamId);
      if (RoleHelper.isPlayer(req.role)) {
        return ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
      }
      const auction = await AuctionService.getAuctionInfo(auctionId);
      let flag = false;
      if (auction) {
        let teamResponse = await AuctionService.getTeamByTeamId(auctionId, teamId);
        let teamOwnerResponse = await AuctionService.getOwnerByTeamId(teamId);
        if (teamResponse) {
          const teamOwners =
            teamOwnerResponse?.map((owner) => ({
              name: owner.name,
              type: owner.type,
              playerId: owner.playerId,
              email: owner.email,
              mobile: owner.mobile,
            })) || [];

          const team = {
            image: "",
            name: teamResponse.name,
            shortName: teamResponse.shortName,
            shortcutKey: teamResponse.shortcutKey,
            teamId: teamResponse.teamId,
            owners: teamOwners,
          } as AuctionTeamSummaryData;

          const teamPlayers = await AuctionService.getAuctionTeamPlayers(auctionId, teamId);

          let auctionImagePath = "";
          if (auction.imageId) {
            const files = await fileService.getFiles([auction.imageId]);
            if (files?.length === 1) {
              auctionImagePath = path.join(process.cwd(), 'public', 'uploads', files[0].name);
            }
          }
          const siteLogoPath = path.join(process.cwd(), 'public', 'icons', "logo.png");
          if (teamPlayers) {
            generateTeamPDF({
              team,
              teamPlayers,
              auction,
              auctionImagePath,
              siteLogoPath,
              res,
            });
            flag = true;
          }
        }
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static isValidToStartAuction = async (req: Request, res: Response) => {
    try {
      const auctionId = parseInt(req.params.auctionId);
      const auctionInfo = await AuctionService.getLiveAuctionPlayerId(auctionId);
      if (!auctionInfo) {
        return ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
      }

      if (RoleHelper.isAdminAndAbove(req.role) || auctionInfo.playerId === req.userId) {
          ApiResponse.success(res, {count: 1}, 200, "verified successfully!!");
      }

      const isOwner = await AuctionService.isOwnerByAuctionId(auctionId, req.userId);

      if (isOwner) {
          ApiResponse.success(res, {count: 2}, 200, "verified successfully!!");
      }

       ApiResponse.success(res, {count: 3}, 200, "verified successfully!!");
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };
}
