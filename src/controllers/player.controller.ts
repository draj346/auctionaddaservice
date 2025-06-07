import { Request, Response } from "express";
import { PlayerService } from "../services/player.service";
import { ApiResponse } from "../utils/apiResponse";
import * as XLSX from "xlsx";

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
      const players = await playerService.getPlayers(req, false);
      ApiResponse.success(res, players, 200, "Players retrieved successfully");
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.");
    }
  };

  static exportPlayers = async (req: Request, res: Response) => {
    try {
      const players = await playerService.getPlayerForExport();

      if (players.length === 0) {
        return ApiResponse.error(
          res,
          "No player data available for export",
          404
        );
      }

      // Extract all unique keys from the first player (assuming consistent structure)
      const allKeys = Object.keys(players[0]);

      // Create headers by formatting keys
      const headers = allKeys.map((key) =>
        key.replace(/_/g, " ").toUpperCase()
      );

      // Build data rows ensuring consistent column order
      const rows = players.map((player) =>
        allKeys.map((key) => player[key as keyof typeof player] ?? null)
      );

      // Create worksheet with headers and data
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

      // Create workbook and generate buffer
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Player Data");
      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      // Set response headers for Excel download
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=players_export.xlsx"
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      return res.send(buffer);
    } catch (error) {
      console.error("Export error:", error);
      return ApiResponse.error(res, "Failed to generate export file", 500);
    }
  };
}
