import { Request, Response } from "express";
import { PlayerService } from "../services/player.service";
import { ApiResponse } from "../utils/apiResponse";

const playerService = new PlayerService();

export class PlayerController {
  static getPlayers = async (req: Request, res: Response) => {
    try {
      const players = await playerService.getPlayers(req);
      ApiResponse.success(res, players, 200, "Players retrieved successfully");
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.");
    }
  };

}
