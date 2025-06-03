import pool from "../config/db.config";
import { PlayerQueries } from "../queries/player.queries";
import {
  Player,
  InitialRegistrationData,
  UpdateProfileSchemaData,
  PlayerExistsSchema,
} from "../types/player.types";
import { encryptPassword } from "../utils/encryption";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export class PlayerService {
  async initialRegistration(
    data: InitialRegistrationData
  ): Promise<PlayerExistsSchema> {
    const [existing] = await pool.execute<RowDataPacket[]>(
      PlayerQueries.findPlayerByMobile,
      [data.mobile]
    );

    if (existing.length > 0) {
      return {
        playerId: existing[0].playerId,
        isRegistered: existing[0].isSubmitted === 1 ? true: false,
      };
    }

    const [result] = await pool.execute<ResultSetHeader>(
      PlayerQueries.insertPlayer,
      [data.name, data.mobile, data.email || null]
    );

    return {
      playerId: result.insertId,
      isRegistered: false,
    };
  }

  async updateProfile(data: UpdateProfileSchemaData): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      PlayerQueries.updatePlayer,
      [
        data.jerseyNumber || null,
        data.tShirtSize || null,
        data.lowerSize || null,
        data.hasCricheroesProfile === undefined ? null : data.hasCricheroesProfile,
        data.isPaidPlayer === undefined ? null : data.isPaidPlayer,
        data.pricePerMatch || null,
        data.willJoinAnyOwner === undefined ? null : data.willJoinAnyOwner,
        data.image || null,
        data.isSubmitted === undefined ? null : data.isSubmitted,
        data.isNonPlayer === undefined ? null : data.isNonPlayer,
        data.isOwner === undefined ? null : data.isOwner,
        data.isAdmin === undefined ? null : data.isAdmin,
        data.playerId || null,
      ]
    );

    return result.affectedRows > 0;
  }

  async getPlayers(): Promise<Player[]> {
    const [players] = await pool.execute<RowDataPacket[]>(
      PlayerQueries.getPlayers
    );
    return players as Player[];
  }

  async findPlayerByIdentifier(identifier: string): Promise<Player | null> {
    const [players] = await pool.execute<RowDataPacket[]>(
      PlayerQueries.findPlayerByIdentifier,
      [identifier, identifier]
    );

    return players.length > 0 ? (players[0] as Player) : null;
  }

  async updatePassword(
    playerId: number,
    newPassword: string
  ): Promise<boolean> {
    const hashedPassword = await encryptPassword(newPassword);
    const [result] = await pool.execute<ResultSetHeader>(
      PlayerQueries.updatePassword,
      [hashedPassword, playerId]
    );

    return result.affectedRows > 0;
  }
}
