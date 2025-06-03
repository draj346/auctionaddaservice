import { Request, Response } from "express";
import { PlayerService } from "../services/player.service";
import {
  InitialRegistrationData,
  UpdateProfileSchemaData,
} from "../types/player.types";
import { ApiResponse } from "../utils/apiResponse";

const playerService = new PlayerService();

export class PlayerController {
  static initialRegistration = async (req: Request, res: Response) => {
    try {
      const data: InitialRegistrationData = req.body;
      const playerInfo = await playerService.initialRegistration(data);
      ApiResponse.success(
        res,
        { ...playerInfo },
        201,
        "Registration initiated successfully"
      );
    } catch (error) {
      ApiResponse.error(
        res,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  static updateProfile = async (req: Request, res: Response) => {
    try {
      const data: UpdateProfileSchemaData = req.body;
      const success = await playerService.updateProfile(data);

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
      ApiResponse.error(
        res,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  static getPlayers = async (req: Request, res: Response) => {
    try {
      const players = await playerService.getPlayers();
      ApiResponse.success(res, players, 200, "Players retrieved successfully");
    } catch (error) {
      ApiResponse.error(
        res,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };
}
