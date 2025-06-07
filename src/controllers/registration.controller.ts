import { Request, Response } from "express";
import {
  InitialRegistrationData,
  UpdateProfileSchemaData,
} from "../types/player.types";
import { ApiResponse } from "../utils/apiResponse";
import { RegistrationService } from "../services/registration.service";

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

}
