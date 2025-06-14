import { Request, Response } from "express";
import {
  AddProfileSchemaData,
  AddProfileExcelSchema,
  InitialRegistrationData,
  UpdateProfileSchemaData,
} from "../types/player.types";
import { ApiResponse } from "../utils/apiResponse";
import { RegistrationService } from "../services/registration.service";
import { RoleService } from "../services/role.service";
import { uploadToMemory } from "../utils/multerConfig";
import * as XLSX from "xlsx";

const registrationService = new RegistrationService();

export class RegistrationController {
  static initialRegistration = async (req: Request, res: Response) => {
    try {
      const data: InitialRegistrationData = req.body;
      const playerInfo = await registrationService.initialRegistration(data);
      if (playerInfo.playerId) {
        ApiResponse.success(
          res,
          { ...playerInfo },
          200,
          "Registration initiated successfully"
        );
      } else {
        ApiResponse.error(
          res,
          "Something went happen. Please try again.",
          200,
          playerInfo
        );
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.");
    }
  };

  static updatePlayers = async (req: Request, res: Response) => {
    try {
      const data: UpdateProfileSchemaData = req.body;
      const success = await registrationService.updateProfile(data);

      if (success) {
        ApiResponse.success(
          res,
          null,
          200,
          "Registration completed successfully"
        );
      } else {
        ApiResponse.error(res, "Player not found or update failed", 401);
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
        ApiResponse.success(res, null, 200, "Player added successfully");
      } else {
        ApiResponse.error(
          res,
          "Something went happen. Please try again.",
          200,
          result,
          { isError: true }
        );
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

      const hasAccess = await RoleService.hasAccess(
        req.role,
        req.userId,
        data.playerId
      );
      if (!hasAccess) {
        return ApiResponse.error(res, "Access Denied", 401, {
          isAccessDenied: true,
        });
      }

      const success = await registrationService.updateProfile(data);
      if (success) {
        ApiResponse.success(res, null, 200, "Profile updated successfully");
      } else {
        ApiResponse.error(res, "Player not found or update failed", 401, {
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

  static deletePlayers = async (req: Request, res: Response) => {
    try {
      const playerId = parseInt(req.params.playerId);

      const hasAccess = await RoleService.hasAccess(
        req.role,
        req.userId,
        playerId
      );
      if (!hasAccess || req.userId * 1 === playerId) {
        return ApiResponse.error(res, "Access Denied", 401, {
          isAccessDenied: true,
        });
      }

      const success = await registrationService.deleteProfile(playerId);
      if (success) {
        ApiResponse.success(res, null, 200, "Profile deleted successfully");
      } else {
        ApiResponse.error(res, "Player not found or update failed", 401, {
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

  static AddMultiplePlayers = async (req: Request, res: Response) => {
    try {
      await new Promise<void>((resolve, reject) => {
        uploadToMemory.single("file")(req, res, (err: any) => {
          if (err) return reject(err);
          resolve();
        });
      });

      if (!req.file) {
        return ApiResponse.error(res, "No file uploaded", 400);
      }

      if (!req.file.buffer || req.file.buffer.length === 0) {
        return ApiResponse.error(res, "Empty file buffer", 400);
      }

      const workbook = XLSX.read(req.file.buffer, {
        type: "buffer",
        cellDates: true,
        sheetStubs: true,
      });

      if (
        !workbook.SheetNames.length ||
        !workbook.Sheets[workbook.SheetNames[0]]
      ) {
        return ApiResponse.error(res, "No worksheets found in Excel file", 400);
      }

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const users: AddProfileExcelSchema[] = XLSX.utils.sheet_to_json(
        worksheet,
        {
          header: [
            "Full Name",
            "Mobile",
            "Email",
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
        }
      );

      if (!worksheet["K1"] || worksheet["K1"].v !== "Result") {
        XLSX.utils.sheet_add_aoa(worksheet, [["Result"]], { origin: "K1" });
      }

      const processedUsers = await Promise.all(
        users.map(async (user, index) => {
          const row = index + 2;
          try {
            await registrationService.createProfileForExcel(user);
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
          origin: `K${user.Row}`,
        });
      });

      const updatedBuffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=processed_results.xlsx"
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.send(updatedBuffer);
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Uploading failed. Please try again.");
    }
  };

}
