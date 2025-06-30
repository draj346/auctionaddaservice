import { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse";
import { RoleService } from "../services/role.service";
import { ErrorResponsePayload } from "../types";
import { PlayerIdsSchema } from "../types/player.types";

const roleService = new RoleService();

export class RoleController {
  static createAdmin = async (req: Request, res: Response) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const result = await roleService.createAdmin(playerId);
      if (result) {
        ApiResponse.success(res, {}, 200, "Admin created successfully");
      } else {
        ApiResponse.error(res, "Update Failed", 200, {isUpdateFailed: true});
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(
        res,
        "Something went happen. Please try again.",
        500,
        {isError: false}
      );
    }
  };

  static removeAdmin = async (req: Request, res: Response) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const result = await roleService.deleteRole(playerId);
       if (result) {
        ApiResponse.success(res, {}, 200, "Role remove successfully");
      } else {
        ApiResponse.error(res, "Update Failed", 200, {isUpdateFailed: true});
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(
        res,
        "Something went happen. Please try again.",
        500,
        {isError: false}
      );
    }
  };

  static approvePlayers = async (req: Request, res: Response) => {
    try {
      const data: PlayerIdsSchema = req.body;

      const accessChecks = data.playerIds.map(async (playerId) => {
        const hasAccess = await RoleService.isAdminOrAboveForDelete(
          req.role,
          playerId,
        );
        return { playerId, allowed: hasAccess && playerId != req.userId};
      });

      const accessResults = await Promise.all(accessChecks);

      const allowedPlayerIds = accessResults
        .filter((result) => result.allowed)
        .map((result) => result.playerId);

      if (allowedPlayerIds.length === 0) {
        return ApiResponse.error(res, "Access Denied", 403, {
          isAccessDenied: true,
        });
      }

      const success = await roleService.approvePlayers(allowedPlayerIds);

      if (!success) {
        return ApiResponse.error(res, "Update failed", 200, { 
          isUpdateFailed: true 
        });
      }

      if (data.playerIds.length !== allowedPlayerIds.length) {
        const skippedPlayerIds = data.playerIds.filter(
          (id) => !allowedPlayerIds.includes(id)
        );
        return ApiResponse.success(
          res,
          { skippedPlayerIds },
          200,
          "Some profiles approved successfully"
        );
      }
      ApiResponse.success(res, {skippedPlayerIds: []}, 200, "Players approved successfully");
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, {
        isError: true,
      });
    }
  };
}
