import { Request, Response } from "express";
import { PlayerService } from "../services/player.service";
import { ApiResponse } from "../utils/apiResponse";
import * as XLSX from "xlsx";
import { PlayerIdsSchema, PlayerPaginationSchema } from "../types/player.types";
import { RoleService } from "../services/role.service";

const playerService = new PlayerService();

export class PlayerController {
  static getPlayers = async (req: Request, res: Response) => {
    try {
      const data = req.query as unknown as PlayerPaginationSchema;
      const page = data.page || 1;
      const search = data.search || "";
      const approved = data.approved || "all";
      const active = data.active || "all";
      const sort = data.sort || "";
      const limit = 100;

      const { players, total, hasMore } = await playerService.getPlayers(
        req.role,
        req.userId,
        page,
        limit,
        search,
        approved,
        sort,
        active
      );
      ApiResponse.success(res, { players, total, hasMore }, 200, "Players retrieved successfully");
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.");
    }
  };

  static getPlayersById = async (req: Request, res: Response) => {
    try {
      const playerId = parseInt(req.params.playerId);

      if (!playerId) {
        return ApiResponse.error(res, "Player not found or update failed", 404, {
          isNotFound: true,
        });
      }

      const player = await playerService.getPlayerById(req.role, playerId, true, req.userId);
      if (player) {
        ApiResponse.success(res, player, 200, "Players retrieved successfully");
      } else {
        return ApiResponse.error(res, "Player not found or not eligible to view the profile", 404, {
          isAccessDenied: true,
        });
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, {
        isError: true,
      });
    }
  };

  static getPlayersByIdForEdit = async (req: Request, res: Response) => {
    try {
      const playerId = parseInt(req.params.playerId);

      if (!playerId) {
        return ApiResponse.error(res, "Player not found or update failed", 404, {
          isNotFound: true,
        });
      }

       const hasAccess = await RoleService.isSelfOrAdminOrAbove(
          req.role,
          req.userId,
          playerId,
          true
        );

        let player = null;
        if (hasAccess) {
          player = await playerService.getPlayerById(req.role, playerId, true, req.userId);
        }
      if (player) {
        ApiResponse.success(res, player, 200, "Players retrieved successfully");
      } else {
        return ApiResponse.error(res, "Player not found or not eligible to view the profile", 404, {
          isAccessDenied: true,
        });
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, {
        isError: true,
      });
    }
  };

  static exportPlayers = async (req: Request, res: Response): Promise<void> => {
    const sendExcel = (
      data: string | any[][],
      status: number,
      filename: string,
      sheetName: string = "Status"
    ) => {
      const ws = XLSX.utils.aoa_to_sheet(
        typeof data === "string" ? [[data]] : data
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.status(status).send(buffer);
    };
    try {
      const data: PlayerIdsSchema = req.body;
      let allowedPlayerIds: number[] = [];

      if (data.playerIds.length > 0) {
        const accessChecks = data.playerIds.map(async (playerId) => {
          const hasRoleLevelAccess = await RoleService.hasRoleAccessOnly(
            req.role,
            playerId
          );
          return { playerId, allowed: hasRoleLevelAccess };
        });

        const accessResults = await Promise.all(accessChecks);

        allowedPlayerIds = accessResults
          .filter((result) => result.allowed)
          .map((result) => result.playerId);

        if (allowedPlayerIds.length === 0) {
          return sendExcel("Access Denied", 403, "access_denied.xlsx", "Error");
        }
      }

      const players = await playerService.getPlayerForExport(req.role, allowedPlayerIds);

      if (players.length === 0) {
        return sendExcel(
          "No player data available for export",
          200,
          "no_players_found.xlsx"
        );
      }

      const allKeys = Object.keys(players[0]);

      const headers = allKeys.map((key) =>
        key.replace(/_/g, " ").toUpperCase()
      );
      const rows = players.map((player) =>
        allKeys.map((key) => player[key as keyof typeof player] ?? null)
      );

      return sendExcel(
        [headers, ...rows],
        200,
        `players_export_${Date.now()}.xlsx`,
        "Player Data"
      );
    } catch (error) {
      console.error("Export error:", error);
      sendExcel(
        "Internal server error. Please try again later.",
        500,
        "server_error.xlsx",
        "Error"
      );
    }
  };

  static getAdmins = async (req: Request, res: Response) => {
    try {
      const data = req.query as unknown as PlayerPaginationSchema;
      const page = data.page || 1;
      const search = data.search || "";
      const limit = 100;

      const { players, total, hasMore } = await playerService.getAdmins(
        page,
        limit,
        search,
      );
      ApiResponse.success(res, { players, total, hasMore }, 200, "Players retrieved successfully");
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.");
    }
  };
}
