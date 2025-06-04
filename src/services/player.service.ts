import pool from "../config/db.config";
import { PlayerQueries } from "../queries/player.queries";
import {
  Player,
  InitialRegistrationData,
  UpdateProfileSchemaData,
  PlayerExistsSchema,
} from "../types/player.types";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export class PlayerService {
  
  async initialRegistration( data: InitialRegistrationData): Promise<PlayerExistsSchema> {
    if (data.email) {
      const [fullMatches] = await pool.execute<RowDataPacket[]>(
        PlayerQueries.findFullMatch,
        [data.mobile, data.email, data.name]
      );

      if (fullMatches.length > 0) {
        const player = fullMatches[0];
        return {
          ...( player.isSubmitted !== 1 && {playerId: player.playerId}),
          isRegistered: player.isSubmitted === 1,
        };
      }
    }

    let duplicateMobile = false;
    let duplicateEmail = false;

    const [mobileMatches] = await pool.execute<RowDataPacket[]>(
      PlayerQueries.findPlayerByMobile,
      [data.mobile]
    );

    if (mobileMatches.length > 0) {
      duplicateMobile = true;
    }

    if (data.email) {
      const [emailMatches] = await pool.execute<RowDataPacket[]>(
        PlayerQueries.findPlayerByEmail,
        [data.email]
      );

      if (emailMatches.length > 0) {
        duplicateEmail = true;
      }
    }

    if (duplicateMobile || duplicateEmail) {
      return {
        ...(duplicateMobile && { duplicateMobile: true }),
        ...(duplicateEmail && { duplicateEmail: true }),
      };
    }

    const [result] = await pool.execute<ResultSetHeader>(
      PlayerQueries.insertPlayer,
      [data.name, data.mobile, data.email || null]
    );

    return {
      playerId: result.insertId,
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

}
