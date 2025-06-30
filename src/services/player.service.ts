import pool from "../config/db.config";
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
    approved: string = "all",
    sort: string,
    active: string,
  ): Promise<{ players: Player[]; total: number; hasMore: boolean }> {
    const offset = (page - 1) * limit;

    const [result, totalResult] = await Promise.all([
      pool.execute<RowDataPacket[]>(
        PlayerQueries.getPlayers(
          role,
          userId,
          search,
          approved,
          offset,
          limit,
          sort,
          active
        )
      ),
      pool.execute<RowDataPacket[]>(
        PlayerQueries.getPlayersCount(
          role,
          userId,
          search,
          approved,
          active
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

  async getPlayerForExport(role: PlayerRole, playerIds: number[]): Promise<Player[]> {
    const query = PlayerQueries.getPlayerForExport(role, playerIds);
    const [result] = await pool.execute<RowDataPacket[]>(query);
    return result.length > 0 ? (result as Player[]) : [];
  }

  async getPlayerById(role: PlayerRole, playerId: number,  isActive: boolean, userId: number): Promise<Player | null> {
    const [result] = await pool.execute<RowDataPacket[]>(
      PlayerQueries.getPlayerById(role, playerId, isActive, userId),
      [userId]
    );

    return result.length > 0 ? (result[0] as Player) : null;
  }
}
