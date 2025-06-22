import { Request, Response } from "express";
import { PlayerService } from "../services/player.service";
import { ApiResponse } from "../utils/apiResponse";
import * as XLSX from "xlsx";
import { PlayerIdsSchema, playerPaginationSchema } from "../types/player.types";
import { RoleService } from "../services/role.service";

const playerService = new PlayerService();

export class PlayerController {
  static getPlayers = async (req: Request, res: Response) => {
    try {
      const data = req.query as unknown as playerPaginationSchema;
      const page = data.page || 1;
      const search = data.search || "";
      const owner = data.owner || "all";
      const approved = data.approved || "all";
      const sort = data.sort || "";
      const limit = 100;

      const { players, total, hasMore } = await playerService.getPlayers(
        req.role,
        req.userId,
        page,
        limit,
        search,
        owner,
        approved,
        sort
      );
      ApiResponse.success(res, { players, total, hasMore }, 200, "Players retrieved successfully");
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.");
    }
  };

  static getPlayersById = async (req: Request, res: Response) => {
    try {
      const { playerId } = req.body;

      if (!playerId) {
        return ApiResponse.error(res, "Required Player Id", 400);
      }

      const players = await playerService.getPlayerById(req, playerId);
      ApiResponse.success(res, players, 200, "Players retrieved successfully");
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.");
    }
  };

  static getInactivePlayers = async (req: Request, res: Response) => {
    try {
      const data = req.query as unknown as playerPaginationSchema;
      const page = data.page || 1;
      const search = data.search || "";
      const owner = data.owner || "all";
      const approved = data.approved || "all";
      const limit = 100;
      const sort = data.sort || "";

      const { players, total, hasMore } = await playerService.getPlayers(
        req.role,
        req.userId,
        page,
        limit,
        search,
        owner,
        approved,
        sort,
        false
      );
      ApiResponse.success(res, { players, total, hasMore }, 200, "Players retrieved successfully");
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.");
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

      const players = await playerService.getPlayerForExport(allowedPlayerIds);

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
}
