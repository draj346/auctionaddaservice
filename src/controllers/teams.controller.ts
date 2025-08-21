import { Request, Response } from "express";
import { AuctionService } from "../services/auction.service";
import { ApiResponse } from "../utils/apiResponse";
import { RoleHelper } from "../helpers/roles.helpers";
import { NotificationService } from "../services/notification.service";
import { NotificationMessage, NOTIFICATIONS, NotificationType } from "../constants/notification.constants";
import { AuctionsHelper } from "../helpers/auctions.helpers";
import { IAssignOwner, ICreateTeam, IRemoveOwner, ITeamDetails } from "../types/auction.types";
import { FileService } from "../services/file.service";
import { FREE_TEAM_CREATE_LIMIT } from "../config/env";

const fileService = new FileService();

export class TeamsController {
  static upsetTeam = async (req: Request, res: Response) => {
    try {
      const data: ICreateTeam = req.body;
      const auctionId = parseInt(req.params.auctionId);
      data.auctionId = auctionId;

      if (!data.teamId) {
        const flag = await this.canAddNewTeam(auctionId);
        if (!flag) {
          return ApiResponse.error(res, "Permission Denied", 200, { isFreeLimitReached: true });
        }
      }

      const auctionPlayerId = await AuctionService.isValidAuctionPlayerIdForEdit(data.auctionId);
      if (!auctionPlayerId) {
        return ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
      }
      if (!RoleHelper.isAdminAndAbove(req.role)) {
        if (auctionPlayerId !== req.userId) {
          return ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
        }
      }

      const newTeamId = await AuctionService.upsetTeam(data);
      if (newTeamId) {
        if (data.teamId) {
          NotificationService.createNotification(
            auctionPlayerId,
            auctionPlayerId === req.userId
              ? NotificationMessage.TEAM_UPDATE_BY_SELF
              : NotificationMessage.TEAM_UPDATE_BY_ELSE,
            NOTIFICATIONS.CATEGORY_UPDATED as NotificationType,
            req.userId,
            req.role,
            AuctionsHelper.getNotificationJSON(data.name)
          );
        } else {
          NotificationService.createNotification(
            auctionPlayerId,
            NotificationMessage.TEAM_CREATE_BY_SELF,
            NOTIFICATIONS.TEAM_CREATED as NotificationType,
            req.userId,
            req.role,
            AuctionsHelper.getNotificationJSON(data.name)
          );
        }

        return ApiResponse.success(
          res,
          {},
          200,
          data.teamId ? "Team updated successfully!!" : "Team created successfully!!"
        );
      }
      return ApiResponse.error(res, "Something went happen. Please try again.", 200, { isError: true });
    } catch (error) {
      console.log(error);
      return ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static getTeamsByAuction = async (req: Request, res: Response) => {
    try {
      const auctionId = parseInt(req.params.auctionId);
      let teamResponse = await AuctionService.getTeamsByAuctionId(auctionId);
      if (teamResponse) {
        teamResponse = await this.updateFilePaths(teamResponse);
        ApiResponse.success(res, teamResponse, 200, "Auction Category retrieve successfully!!");
      } else {
        ApiResponse.success(res, [], 200, "Something went happen. Please try again.");
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static deleteTeam = async (req: Request, res: Response) => {
    try {
      const auctionId = parseInt(req.params.auctionId);
      const teamId = parseInt(req.params.teamId);
      const teamResponse = await AuctionService.deleteTeamsById(
        teamId,
        RoleHelper.isAdminAndAbove(req.role),
        req.userId,
        auctionId
      );
      if (teamResponse) {
        const response: any = {};
        if (teamResponse.status) {
          if (teamResponse.imagePath) {
            await fileService.deleteUploadedFile(teamResponse.imagePath);
          }
          if (RoleHelper.isOrganiser(req.role)) {
            NotificationService.createNotification(
              teamResponse.playerId || req.userId,
              teamResponse.playerId === req.userId
                ? NotificationMessage.TEAM_DELETED_BY_SELF
                : NotificationMessage.TEAM_DELETED_BY_ELSE,
              NOTIFICATIONS.TEAM_DELETED as NotificationType,
              req.userId,
              req.role,
              AuctionsHelper.getNotificationJSON(teamResponse.name || "")
            );
          }

          if (teamResponse.isNotFound !== undefined) response.isNotFound = teamResponse.isNotFound;
          if (teamResponse.status !== undefined) response.status = teamResponse.status;
          if (teamResponse.isAccessDenied !== undefined) response.isAccessDenied = teamResponse.isAccessDenied;
          if (teamResponse.isLive !== undefined) response.isLive = teamResponse.isLive;
          if (teamResponse.isError !== undefined) response.isError = teamResponse.isError;

          ApiResponse.success(res, response, 200, "Team Deleted!!");
        } else {
          ApiResponse.error(res, "Unable to delete Team. Please try again", 200, { isError: true });
        }
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static getTeamById = async (req: Request, res: Response) => {
    try {
      const auctionId = parseInt(req.params.auctionId);
      const teamId = parseInt(req.params.teamId);
      let teamResponse = await AuctionService.getTeamById(auctionId, teamId);
      let teamOwnerResponse = await AuctionService.getTeamOwnerInfo(teamId);
      if (teamResponse) {
        teamResponse = await this.updateFilePath(teamResponse);
        const response = {
          team: teamResponse,
          owners: teamOwnerResponse || []
        }
        ApiResponse.success(res, response, 200, "Team Details!!");
      } else {
        ApiResponse.error(res, "Unable to retrieve Team. Please try again", 200, { isNotFound: true });
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static assignOwnerToTeam = async (req: Request, res: Response) => {
    try {
      const data: IAssignOwner = req.body;
      if (!RoleHelper.isAdminAndAbove(req.role)) {
        const isAuctionValid = await AuctionService.isValidAuctionForAccess(data.auctionId, req.userId);
        if (!isAuctionValid) {
          return ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
        }
      }
      let teamResponse = await AuctionService.assignOwnerToTeam(data);
      if (teamResponse) {
        ApiResponse.success(res, teamResponse, 200, "Team Details!!");
      } else {
        ApiResponse.error(res, "Unable to retrieve Team. Please try again", 200, { isNotFound: true });
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static removeOwnerFromTeam = async (req: Request, res: Response) => {
    try {
      const data: IRemoveOwner = req.body;
      if (!RoleHelper.isAdminAndAbove(req.role)) {
        const isAuctionValid = await AuctionService.isValidAuctionForAccess(data.auctionId, req.userId);
        if (!isAuctionValid) {
          return ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
        }
      }
      let teamResponse = await AuctionService.removeOwnerFromTeam(data);
      if (teamResponse) {
        ApiResponse.success(res, {}, 200, "Team Owner Removed!!");
      } else {
        ApiResponse.error(res, "Unable to remove from Team Owner. Please try again", 200, { isNotFound: true });
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static canAddTeam = async (req: Request, res: Response) => {
    try {
      const auctionId = parseInt(req.params.auctionId);
      const response = await this.canAddNewTeam(auctionId);
      ApiResponse.success(res, {status: response}, 200, "Team Status Retrieved Successfully");
    } catch (error) {
      console.log(error);
      ApiResponse.success(res, {status: false}, 200, "Team Status Retrieved Successfully");
    }
  }

  private static canAddNewTeam = async(auctionId: number) => {
    try {
      let countResponse = await AuctionService.getTeamCount(auctionId);
      return countResponse < FREE_TEAM_CREATE_LIMIT;
    } catch (error) {
       console.log(error);
       return false;
    }
  }

  private static updateFilePaths = async (teamResponse: ITeamDetails[]) => {
    if (teamResponse.length > 0) {
      const imageIds = [...new Set(teamResponse.map((a) => a.imageId))].filter((id): id is number => id !== null);
      if (imageIds.length > 0) {
        const files = await fileService.getFiles(imageIds);
        if (files) {
          const fileMap = new Map<number, string>();
          files.forEach((file) => fileMap.set(file.fileId, file.path));
          return teamResponse.map((team) => ({
            ...team,
            imagePath: team.imageId !== null ? fileMap.get(team.imageId) || "" : "",
          }));
        }
      }
    }
    return teamResponse;
  };

  private static updateFilePath = async (teamResponse: ITeamDetails) => {
    if (teamResponse.imageId) {
      const imageIds = [teamResponse.imageId];
      const files = await fileService.getFiles(imageIds);
      if (files?.length === 1) {
        teamResponse.imagePath = files[0].path;
      }
    }

    return teamResponse;
  };
}
