import { Request, Response } from "express";
import { PlayerService } from "../services/player.service";
import {
  InitialRegistrationData,
  CompleteRegistrationData,
} from "../types/player.types";
import { ApiResponse } from "../utils/apiResponse";
import upload from "../utils/multerConfig";
import { AuthService } from "../services/auth.service";

const playerService = new PlayerService();

export class PlayerController {
  static initialRegistration = async (req: Request, res: Response) => {
    try {
      const data: InitialRegistrationData = req.body;
      const playerId = await playerService.initialRegistration(data);
      ApiResponse.success(
        res,
        { playerId },
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

  static uploadImage = async (req: Request, res: Response) => {
    try {
      upload.single("image")(req, res, async (err) => {
        if (err) {
          return ApiResponse.error(res, err.message, 400);
        }

        if (!req.file) {
          return ApiResponse.error(res, "No image uploaded", 400);
        }
        const { playerId } = req.body;
        const imagePath = req.file.path;
        const url = `/uploads/${req.file.filename}`;

        const isValidUser = await AuthService.isValidUser(playerId);
        if (!isValidUser) {
          playerService.deleteUploadedFile(imagePath);
          return ApiResponse.error(res, "User not found", 404);
        }

        const isUploaded = await playerService.uploadPlayerImage({
          image: url,
          playerId,
        });

        if (isUploaded) {
          return ApiResponse.success(
            res,
            {
              path: imagePath,
              url,
            },
            201,
            "Image uploaded successfully"
          );
        } else {
          return ApiResponse.error(res, "Upload failed");
        }
      });
    } catch (error) {
      ApiResponse.error(
        res,
        error instanceof Error ? error.message : "Upload failed"
      );
    }
  };

  static completeRegistration = async (req: Request, res: Response) => {
    try {
      const data: CompleteRegistrationData = req.body;
      const success = await playerService.completeRegistration(data);

      if (success) {
        ApiResponse.success(
          res,
          null,
          200,
          "Registration completed successfully"
        );
      } else {
        ApiResponse.error(res, "Player not found or update failed", 404);
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
