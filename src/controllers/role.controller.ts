import { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse";
import { RoleService } from "../services/role.service";
import { ErrorResponsePayload } from "../types";

const roleService = new RoleService();

export class RoleController {
  static createAdmin = async (req: Request, res: Response) => {
    const payload = { isAccessDenied: true } as ErrorResponsePayload;
    try {
      const playerId = parseInt(req.params.playerId);
      const players = await roleService.createAdmin(playerId);
      ApiResponse.success(res, {}, 200, "Admin created successfully");
    } catch (error) {
      console.log(error);
      ApiResponse.error(
        res,
        "Something went happen. Please try again.",
        500,
        payload
      );
    }
  };

  static removeAdmin = async (req: Request, res: Response) => {
    const payload = { isAccessDenied: true } as ErrorResponsePayload;
    try {
      const playerId = parseInt(req.params.playerId);
      const players = await roleService.deleteRole(playerId);
      ApiResponse.success(res, {}, 200, "Role remove successfully");
    } catch (error) {
      console.log(error);
      ApiResponse.error(
        res,
        "Something went happen. Please try again.",
        500,
        payload
      );
    }
  };

   static approvePlayers = async (req: Request, res: Response) => {
    try {
      const {playerIds} = req.body;

      if (playerIds.includes(req.userId)) {
        return ApiResponse.error(res, "You can't approve yourself", 400, { isAccessDenied: true });
      }

      const players = await roleService.approvePlayers(playerIds);
      ApiResponse.success(res, {}, 200, "Players approved successfully");
    } catch (error) {
      console.log(error);
      ApiResponse.error(
        res,
        "Something went happen. Please try again.",
        500,
        {isError: true}
      );
    }
  };
}
