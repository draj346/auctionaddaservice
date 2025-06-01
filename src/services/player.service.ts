import pool from "../config/db.config";
import { PlayerQueries } from "../queries/player.queries";
import {
  Player,
  InitialRegistrationData,
  CompleteRegistrationData,
  RegistrationProfileImage,
} from "../types/player.types";
import { encryptPassword } from "../utils/encryption";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import fs from "fs/promises";

export class PlayerService {
  async initialRegistration(data: InitialRegistrationData): Promise<number> {
    const [existing] = await pool.execute<RowDataPacket[]>(
      PlayerQueries.findPlayerByMobile,
      [data.mobile]
    );

    if (existing.length > 0) {
      console.log("User Registered Already!!");
      return existing[0].playerId;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      PlayerQueries.insertPlayer,
      [data.name, data.mobile, data.email]
    );

    return result.insertId;
  }

  async completeRegistration(data: CompleteRegistrationData): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      PlayerQueries.updatePlayer,
      [
        data.jerseyNumber,
        data.tShirtSize,
        data.lowerSize,
        data.hasCricheroesProfile,
        data.isPaidPlayer,
        data.pricePerMatch,
        data.willJoinAnyOwner,
        data.isSubmitted,
        data.isNonPlayer,
        data.isOwner,
        data.isAdmin,
        data.playerId,
      ]
    );

    return result.affectedRows > 0;
  }

  async uploadPlayerImage(data: RegistrationProfileImage): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      PlayerQueries.updateImage,
      [data.image, data.playerId]
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

async deleteUploadedFile(filePath: string): Promise<void> {
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
      console.log(`Deleted orphaned file: ${filePath}`);
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  }
}
