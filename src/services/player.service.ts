import pool from "../config/db.config";
import { Request } from "express";
import { PlayerQueries } from "../queries/player.queries";
import { Player } from "../types/player.types";
import { RowDataPacket } from "mysql2";

export class PlayerService {
  async getPlayers(req: Request): Promise<Player[]> {
    if (req.isAdmin) {
      const [players] = await pool.execute<RowDataPacket[]>(
        PlayerQueries.getPlayers
      );
      return players as Player[];
    }

    const [userPlayers] = await pool.execute<RowDataPacket[]>(
      PlayerQueries.getPlayerById,
      [req.userId]
    );
    
    const [teamPlayers] = await pool.execute<RowDataPacket[]>(
      PlayerQueries.getPlayerByTeamOwnerId,
      [req.userId]
    );

    const playerMap = new Map();
    [...userPlayers, ...teamPlayers].forEach((player) => {
      playerMap.set(player.playerId, player);
    });

    return Array.from(playerMap.values()) as Player[];
  }
}
