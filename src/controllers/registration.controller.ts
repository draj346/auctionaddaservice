import { Request, Response } from "express";
import {
  AddProfileSchemaData,
  AddProfileExcelSchema,
  InitialRegistrationData,
  UpdateProfileSchemaData,
  PlayerIdsSchema,
  Player,
} from "../types/player.types";
import { ApiResponse } from "../utils/apiResponse";
import { RegistrationService } from "../services/registration.service";
import { RoleService } from "../services/role.service";
import { uploadToMemory } from "../utils/multerConfig";
import * as XLSX from "xlsx";
import { NotificationService } from "../services/notification.service";
import { NotificationMessage, NOTIFICATIONS, NotificationType } from "../constants/notification.constants";
import { PlayerService } from "../services/player.service";
import { getChangedData } from "../utils/common";

const registrationService = new RegistrationService();
const playerService = new PlayerService();

export class RegistrationController {
  static initialRegistration = async (req: Request, res: Response) => {
    try {
      const data: InitialRegistrationData = req.body;
      const playerInfo = await registrationService.initialRegistration(data);
      ApiResponse.success(
        res,
        { ...playerInfo },
        200,
        playerInfo.playerId ? "Registration initiated successfully" : "Something went happen. Please try again."
      );
    } catch (error) {
      console.log("eror");
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.");
    }
  };

  static addPlayerInformation = async (req: Request, res: Response) => {
    try {
      const data: UpdateProfileSchemaData = req.body;

      const isValidUser = await registrationService.isUserProfileSubmitted(data.playerId);

      if (!isValidUser) {
        ApiResponse.error(res, "Player not found or update failed", 400, {
          isRegistered: true,
        });
      }

      const success = await registrationService.addPlayerInformation(data);

      if (success) {
        NotificationService.createNotification(
          data.playerId,
          NotificationMessage.ACCOUNT_CREATE_BY_SELF,
          NOTIFICATIONS.PROFILE_CREATED as NotificationType,
          data.playerId,
          req.role
        );
        ApiResponse.success(res, null, 200, "Registration completed successfully");
      } else {
        ApiResponse.error(res, "Player not found or update failed", 404);
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.");
    }
  };

  static addPlayers = async (req: Request, res: Response) => {
    try {
      const data: AddProfileSchemaData = req.body;
      const result = await registrationService.createProfile(data);

      if (result && result.playerId) {
        ApiResponse.success(res, { ...result }, 200, "Player added successfully");
        NotificationService.createNotification(
          result.playerId,
          NotificationMessage.ACCOUNT_CREATE_BY_ELSE,
          NOTIFICATIONS.PROFILE_CREATED as NotificationType,
          req.userId,
          req.role
        );
      } else {
        ApiResponse.error(res, "Something went happen. Please try again.", 200, result, { isError: true });
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, {
        isError: true,
      });
    }
  };

  static updatePlayersByRole = async (req: Request, res: Response) => {
    try {
      const data: UpdateProfileSchemaData = req.body;
      data.playerId = parseInt(req.params.playerId);

      const hasAccess = await RoleService.isSelfOrAdminOrAbove(req.role, req.userId, data.playerId);
      if (!hasAccess) {
        return ApiResponse.error(res, "Access Denied", 403, {
          isAccessDenied: true,
        });
      }
      let previousInfo: Player | null = null;
      if (req.userId !== data.playerId) {
        previousInfo = await playerService.getPlayerById(req.role, data.playerId, true, req.userId);
      }

      const success = await registrationService.updateProfile(data);
      if (success) {
        const message =
          req.userId === data.playerId
            ? NotificationMessage.ACCOUNT_UPDATE_BY_SELF
            : NotificationMessage.ACCOUNT_UPDATE_BY_ELSE;
        NotificationService.createNotification(
          data.playerId,
          message,
          NOTIFICATIONS.PROFILE_UPDATE as NotificationType,
          req.userId,
          req.role
        );

        if (req.userId !== data.playerId) {
          if (previousInfo) {
            const updatedInfo: any = { ...data };
            if (data.image) {
              const image = await playerService.getImageUrl(data.image);
              updatedInfo.image = image;
            }
            const { previousData, updatedData } = getChangedData(previousInfo, updatedInfo);
            NotificationService.createPendingUpdate(
              data.playerId,
              req.userId,
              updatedData,
              NotificationMessage.APPROVAL_REQUEST,
              req.role,
              NOTIFICATIONS.APPROVAL_REQUEST as NotificationType,
              previousData
            );
          }
        }
        ApiResponse.success(res, { playerId: data.playerId }, 200, "Profile updated successfully");
      } else {
        ApiResponse.error(res, "Player not found or update failed", 404, {
          isError: true,
        });
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, {
        isError: true,
      });
    }
  };

  static deletePlayer = async (req: Request, res: Response) => {
    try {
      const playerId = parseInt(req.params.playerId);

      const hasAccess = await RoleService.isAdminOrAboveForDelete(req.role, playerId);
      if (!hasAccess) {
        return ApiResponse.error(res, "Access Denied", 403, {
          isAccessDenied: true,
        });
      }

      const success = await registrationService.deleteProfile(playerId);
      if (success) {
        ApiResponse.success(res, null, 200, "Profile deleted successfully");
      } else {
        ApiResponse.error(res, "Player not found or update failed", 404, {
          isError: true,
        });
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, {
        isError: true,
      });
    }
  };

  static deactivatePlayers = async (req: Request, res: Response) => {
    try {
      const data: PlayerIdsSchema = req.body;

      const accessChecks = data.playerIds.map(async (playerId) => {
        const hasAccess = await RoleService.isAdminOrAboveForDelete(req.role, playerId);
        return { playerId, allowed: hasAccess && playerId != req.userId };
      });

      const accessResults = await Promise.all(accessChecks);

      const allowedPlayerIds = accessResults.filter((result) => result.allowed).map((result) => result.playerId);

      if (allowedPlayerIds.length === 0) {
        return ApiResponse.error(res, "Access Denied", 403, {
          isAccessDenied: true,
        });
      }

      const success = await registrationService.deactivatePlayers(allowedPlayerIds);

      if (!success) {
        return ApiResponse.error(res, "Players not found or update failed", 404, { isUpdateFailed: true });
      }

      if (data.playerIds.length !== allowedPlayerIds.length) {
        const skippedPlayerIds = data.playerIds.filter((id) => !allowedPlayerIds.includes(id));
        return ApiResponse.success(res, { skippedPlayerIds }, 200, "Some profiles deactivated successfully");
      }

      return ApiResponse.success(res, { skippedPlayerIds: [] }, 200, "Profiles deactivated successfully");
    } catch (error) {
      console.error("Deactivation error:", error);
      return ApiResponse.error(res, "Something went wrong. Please try again.", 500, { isError: true });
    }
  };

  static activatePlayers = async (req: Request, res: Response) => {
    try {
      const data: PlayerIdsSchema = req.body;

      const accessChecks = data.playerIds.map(async (playerId) => {
        const hasAccess = await RoleService.isAdminOrAboveForDelete(req.role, playerId);
        return { playerId, allowed: hasAccess && playerId != req.userId };
      });

      const accessResults = await Promise.all(accessChecks);

      const allowedPlayerIds = accessResults.filter((result) => result.allowed).map((result) => result.playerId);

      if (allowedPlayerIds.length === 0) {
        return ApiResponse.error(res, "Access Denied", 403, {
          isAccessDenied: true,
        });
      }

      const success = await registrationService.activatePlayers(allowedPlayerIds);

      if (!success) {
        return ApiResponse.error(res, "Players not found or update failed", 404, { isUpdateFailed: true });
      }

      if (data.playerIds.length !== allowedPlayerIds.length) {
        const skippedPlayerIds = data.playerIds.filter((id) => !allowedPlayerIds.includes(id));
        return ApiResponse.success(res, { skippedPlayerIds }, 200, "Some profiles activated successfully");
      }

      return ApiResponse.success(res, { skippedPlayerIds: [] }, 200, "Profiles activated successfully");
    } catch (error) {
      console.error("activation error:", error);
      return ApiResponse.error(res, "Something went wrong. Please try again.", 500, { isError: true });
    }
  };

  static AddMultiplePlayers = async (req: Request, res: Response) => {
    try {
      await new Promise<void>((resolve, reject) => {
        uploadToMemory.single("file")(req, res, (err: any) => {
          if (err) return reject(err);
          resolve();
        });
      });

      if (!req.file) {
        return ApiResponse.error(res, "No file uploaded", 400, { isUpdateFailed: true });
      }

      if (!req.file.buffer || req.file.buffer.length === 0) {
        return ApiResponse.error(res, "Empty file buffer", 400, { isNotFound: true });
      }

      const workbook = XLSX.read(req.file.buffer, {
        type: "buffer",
        cellDates: true,
        sheetStubs: true,
      });

      if (!workbook.SheetNames.length || !workbook.Sheets[workbook.SheetNames[0]]) {
        return ApiResponse.error(res, "No worksheets found in Excel file", 400, { isNotFound: true });
      }

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const users: AddProfileExcelSchema[] = XLSX.utils.sheet_to_json(worksheet, {
        header: [
          "Full Name",
          "Mobile",
          "Email",
          "State",
          "District",
          "Jersey Number",
          "T-Shirt Size",
          "Lower Size",
          "Has Cricheroes Profile",
          "Is Paid Player",
          "Price Per Match",
          "Will Join Any Owner",
        ],
        range: 1,
        defval: null,
      });

      if (!worksheet["M1"] || worksheet["M1"].v !== "Result") {
        XLSX.utils.sheet_add_aoa(worksheet, [["Result"]], { origin: "M1" });
      }

      const allowedPlayerIds: number[] = [];
      const processedUsers = await Promise.all(
        users.map(async (user, index) => {
          const row = index + 2;
          try {
            const response = await registrationService.createProfileForExcel(user);
            if (response.playerId) {
              allowedPlayerIds.push(response.playerId);
            }
            return { ...user, Result: "Success", Row: row };
          } catch (error: any) {
            return {
              ...user,
              Result: `Error: ${error.message}`,
              Row: row,
            };
          }
        })
      );

      processedUsers.forEach((user) => {
        XLSX.utils.sheet_add_aoa(worksheet, [[user.Result]], {
          origin: `M${user.Row}`,
        });
      });

      NotificationService.batchCreateNotification(
        allowedPlayerIds,
        NotificationMessage.ACCOUNT_CREATE_BY_ELSE,
        NOTIFICATIONS.PROFILE_CREATED as NotificationType,
        req.userId,
        req.role
      );

      const updatedBuffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });

      res.setHeader("Content-Disposition", "attachment; filename=processed_results.xlsx");
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.send(updatedBuffer);
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Uploading failed. Please try again.", 500, { isError: true });
    }
  };

  static updateToNonPlayers = async (req: Request, res: Response) => {
    try {
      const data: PlayerIdsSchema = req.body;

      const accessChecks = data.playerIds.map(async (playerId) => {
        const hasAccess = await RoleService.isAdminOrAboveForDelete(req.role, playerId);
        return { playerId, allowed: hasAccess && playerId != req.userId };
      });

      const accessResults = await Promise.all(accessChecks);

      const allowedPlayerIds = accessResults.filter((result) => result.allowed).map((result) => result.playerId);

      if (allowedPlayerIds.length === 0) {
        return ApiResponse.error(res, "Access Denied", 403, {
          isAccessDenied: true,
        });
      }

      const success = await registrationService.updateToNonPlayers(allowedPlayerIds);

      if (!success) {
        return ApiResponse.error(res, "Players not found or update failed", 404, { isUpdateFailed: true });
      }

      NotificationService.batchCreateNotification(
        allowedPlayerIds,
        NotificationMessage.STATUS_CHANGE_TO_NON_PLAYER,
        NOTIFICATIONS.PROFILE_UPDATE as NotificationType,
        req.userId,
        req.role
      );

      if (data.playerIds.length !== allowedPlayerIds.length) {
        const skippedPlayerIds = data.playerIds.filter((id) => !allowedPlayerIds.includes(id));
        return ApiResponse.success(res, { skippedPlayerIds }, 200, "Some profiles updated to Non Players successfully");
      }

      return ApiResponse.success(res, { skippedPlayerIds: [] }, 200, "Profiles updated to Non Players successfully");
    } catch (error) {
      console.error("error:", error);
      return ApiResponse.error(res, "Something went wrong. Please try again.", 500, { isError: true });
    }
  };

  static updateToPlayers = async (req: Request, res: Response) => {
    try {
      const data: PlayerIdsSchema = req.body;

      const accessChecks = data.playerIds.map(async (playerId) => {
        const hasAccess = await RoleService.isAdminOrAboveForDelete(req.role, playerId);
        return { playerId, allowed: hasAccess && playerId != req.userId };
      });

      const accessResults = await Promise.all(accessChecks);

      const allowedPlayerIds = accessResults.filter((result) => result.allowed).map((result) => result.playerId);

      if (allowedPlayerIds.length === 0) {
        return ApiResponse.error(res, "Access Denied", 403, {
          isAccessDenied: true,
        });
      }

      const success = await registrationService.updateToPlayers(allowedPlayerIds);

      if (!success) {
        return ApiResponse.error(res, "Players not found or update failed", 404, { isUpdateFailed: true });
      }

      NotificationService.batchCreateNotification(
        allowedPlayerIds,
        NotificationMessage.STATUS_CHANGE_TO_PLAYER,
        NOTIFICATIONS.PROFILE_UPDATE as NotificationType,
        req.userId,
        req.role
      );

      if (data.playerIds.length !== allowedPlayerIds.length) {
        const skippedPlayerIds = data.playerIds.filter((id) => !allowedPlayerIds.includes(id));
        return ApiResponse.success(res, { skippedPlayerIds }, 200, "Some profiles updated to Players successfully");
      }

      return ApiResponse.success(res, { skippedPlayerIds: [] }, 200, "Profiles updated to Players successfully");
    } catch (error) {
      console.error("error:", error);
      return ApiResponse.error(res, "Something went wrong. Please try again.", 500, { isError: true });
    }
  };
}
