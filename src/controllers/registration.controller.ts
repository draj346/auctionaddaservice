import { Request, Response } from "express";
import {
  AddProfileSchemaData,
  InitialRegistrationData,
  UpdateProfileSchemaData,
} from "../types/player.types";
import { ApiResponse } from "../utils/apiResponse";
import { RegistrationService } from "../services/registration.service";
import { RoleService } from "../services/role.service";

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
        ApiResponse.error(res, "Something went happen. Please try again.", 200, playerInfo);
      }
      
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.");
    }
  };

  static updateProfile = async (req: Request, res: Response) => {
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

  static addProfile = async (req: Request, res: Response) => {
    try {
      const data: AddProfileSchemaData = req.body;
      const result = await registrationService.createProfile(data);

      if (result && result.playerId) {
        ApiResponse.success(
          res,
          null,
          200,
          "Player added successfully"
        );
      } else {
         ApiResponse.error(res, "Something went happen. Please try again.", 200, result, { isError: true });
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

   static updateProfileByRole = async (req: Request, res: Response) => {
    try {
      const data: UpdateProfileSchemaData = req.body;
      data.playerId = parseInt(req.params.playerId);

      const hasAccess = await RoleService.hasAccess(req.role, req.userId, data.playerId);
      if (!hasAccess) {
         return ApiResponse.error(res, "Access Denied", 401, { isAccessDenied: true } );
      }
      
      const success = await registrationService.updateProfile(data);
      if (success) {
        ApiResponse.success(
          res,
          null,
          200,
          "Profile updated successfully"
        );
      } else {
        ApiResponse.error(res, "Player not found or update failed", 401, { isError: true });
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

   static deleteProfile = async (req: Request, res: Response) => {
    try {
      const playerId = parseInt(req.params.playerId);

      const hasAccess = await RoleService.hasAccess(req.role, req.userId, playerId);
      if (!hasAccess || (req.userId * 1) === playerId) {
         return ApiResponse.error(res, "Access Denied", 401, { isAccessDenied: true } );
      }
      
      const success = await registrationService.deleteProfile(playerId);
      if (success) {
        ApiResponse.success(
          res,
          null,
          200,
          "Profile deleted successfully"
        );
      } else {
        ApiResponse.error(res, "Player not found or update failed", 401, { isError: true });
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

}
