import pool from "../config/db.config";
import { Request } from "express";
import { PlayerQueries } from "../queries/player.queries";
import { Player } from "../types/player.types";
import { RowDataPacket } from "mysql2";
import { PlayerRole } from "../constants/roles.constants";

export class PlayerService {
  async getPlayers(
    role: PlayerRole,
    userId: number,
    page: number = 1,
    limit: number,
    search: string = "",
    owner: string = "all",
    approved: string = "all",
    sort: string,
    isActive: boolean = true,
  ): Promise<{ players: Player[]; total: number; hasMore: boolean }> {
    const offset = (page - 1) * limit;

    const [result, totalResult] = await Promise.all([
      pool.execute<RowDataPacket[]>(
        PlayerQueries.getPlayers(
          role,
          isActive,
          userId,
          search,
          owner,
          approved,
          offset,
          limit,
          sort
        )
      ),
      pool.execute<RowDataPacket[]>(
        PlayerQueries.getPlayersCount(
          role,
          isActive,
          userId,
          search,
          owner,
          approved
        )
      ),
    ]);

    const totalPlayers = totalResult[0][0].total;
    const hasMore = offset + limit < totalPlayers;

    return {
      players: result[0].length > 0 ? (result[0] as Player[]) : [],
      total: totalPlayers,
      hasMore
    };
  }

  async getPlayerForExport(playerIds: number[]): Promise<Player[]> {
    const query = PlayerQueries.getPlayerForExport(playerIds);
    const [result] = await pool.execute<RowDataPacket[]>(query);
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
