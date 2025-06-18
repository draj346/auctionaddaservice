import pool from "../config/db.config";
import { Request } from "express";
import { PlayerQueries } from "../queries/player.queries";
import { Player } from "../types/player.types";
import { RowDataPacket } from "mysql2";
import { RoleQueries } from "../queries/role.queries";

export class PlayerService {
  async getPlayers(req: Request, userId: number, isActive: boolean = true): Promise<Player[]> {
    const [result] = await pool.execute<RowDataPacket[]>(
      PlayerQueries.getPlayers(req.role, isActive, userId),
      [req.userId]
    );

    return result.length > 0 ? (result as Player[]) : [];
  }

  async getPlayerForExport(playerIds: number[]): Promise<Player[]> {
    const query = PlayerQueries.getPlayerForExport(playerIds);
    const [result] = await pool.execute<RowDataPacket[]>(
      query
    );
    return result.length > 0 ? (result as Player[]) : [];
  }

  async getPlayerById(req: Request, playerId: number): Promise<Player[]> {
    const [result] = await pool.execute<RowDataPacket[]>(
      PlayerQueries.getPlayerById(req.role, playerId),
      [req.userId]
    );

    return result.length > 0 ? (result as Player[]) : [];
  }
}
