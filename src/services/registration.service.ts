import pool from "../config/db.config";
import { RegistrationQueries } from "../queries/registration.queries";
import {
  InitialRegistrationData,
  UpdateProfileSchemaData,
  PlayerExistsSchema,
  AddProfileSchemaData,
  AddProfileExcelSchema,
} from "../types/player.types";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export class RegistrationService {
  
  async initialRegistration( data: InitialRegistrationData): Promise<PlayerExistsSchema> {
    if (data.email) {
      const [fullMatches] = await pool.execute<RowDataPacket[]>(
        RegistrationQueries.findFullMatch,
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
      RegistrationQueries.findPlayerByMobile,
      [data.mobile]
    );

    if (mobileMatches.length > 0) {
      duplicateMobile = true;
    }

    if (data.email) {
      const [emailMatches] = await pool.execute<RowDataPacket[]>(
        RegistrationQueries.findPlayerByEmail,
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
      RegistrationQueries.insertPlayer,
      [data.name, data.mobile, data.email || null]
    );

    return {
      playerId: result.insertId,
    };
  }

  async updateProfile(data: UpdateProfileSchemaData): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      RegistrationQueries.updatePlayer,
      [
        data.name,
        data.jerseyNumber || null,
        data.tShirtSize || null,
        data.lowerSize || null,
        data.hasCricheroesProfile === undefined ? null : data.hasCricheroesProfile,
        data.isPaidPlayer === undefined ? null : data.isPaidPlayer,
        data.pricePerMatch || null,
        data.willJoinAnyOwner === undefined ? null : data.willJoinAnyOwner,
        data.image || null,
        true,
        data.playerId,
      ]
    );

    return result.affectedRows > 0;
  }

  async createProfile( data: AddProfileSchemaData): Promise<PlayerExistsSchema> {
    if (data.email) {
      const [fullMatches] = await pool.execute<RowDataPacket[]>(
        RegistrationQueries.findFullMatch,
        [data.mobile, data.email, data.name]
      );
      if (fullMatches.length > 0) {
        return {
          isRegistered: true,
        };
      }
    }

    let duplicateMobile = false;
    let duplicateEmail = false;

    const [mobileMatches] = await pool.execute<RowDataPacket[]>(
      RegistrationQueries.findPlayerByMobile,
      [data.mobile]
    );

    if (mobileMatches.length > 0) {
      duplicateMobile = true;
    }

    if (data.email) {
      const [emailMatches] = await pool.execute<RowDataPacket[]>(
        RegistrationQueries.findPlayerByEmail,
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
      RegistrationQueries.createPlayer,
      [
        data.name,
        data.mobile,
        data.email || null,
        data.jerseyNumber || null,
        data.tShirtSize || null,
        data.lowerSize || null,
        data.hasCricheroesProfile === undefined ? null : data.hasCricheroesProfile,
        data.isPaidPlayer === undefined ? null : data.isPaidPlayer,
        data.pricePerMatch || null,
        data.willJoinAnyOwner === undefined ? null : data.willJoinAnyOwner,
        data.image || null,
        true,
      ]
    );

    return {
      playerId: result.insertId,
    };
  }

  async deleteProfile(playerId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      RegistrationQueries.deletePlayer,
      [playerId]
    );

    return result.affectedRows > 0;
  }

  async deactivatePlayers(playerIds: number[]): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      RegistrationQueries.deactivatePlayers,
      [playerIds.join()]
    );

    return result.affectedRows > 0;
  }

  async updateToNonPlayers(playerIds: number[]): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      RegistrationQueries.updateToNonPlayers,
      [playerIds.join()]
    );

    return result.affectedRows > 0;
  }

  async updateToPlayers(playerIds: number[]): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      RegistrationQueries.updateToPlayers,
      [playerIds.join()]
    );

    return result.affectedRows > 0;
  }

   async createProfileForExcel( data: AddProfileExcelSchema): Promise<PlayerExistsSchema> {
    if (data['Email']) {
      const [fullMatches] = await pool.execute<RowDataPacket[]>(
        RegistrationQueries.findFullMatch,
        [data['Mobile'], data['Email'], data['Full Name']]
      );
      if (fullMatches.length > 0) {
        throw new Error("Mobile, Email and Name already exists");
      }
    }

    const [mobileMatches] = await pool.execute<RowDataPacket[]>(
      RegistrationQueries.findPlayerByMobile,
      [data['Mobile']]
    );

    if (mobileMatches.length > 0) {
      throw new Error("Mobile number already exists");
    }

    if (data['Email']) {
      const [emailMatches] = await pool.execute<RowDataPacket[]>(
        RegistrationQueries.findPlayerByEmail,
        [data['Email']]
      );

      if (emailMatches.length > 0) {
        throw new Error("Email already exists");
      }
    }

    const [result] = await pool.execute<ResultSetHeader>(
      RegistrationQueries.createPlayer,
      [
        data['Full Name'],
        data['Mobile'],
        data['Email'] || null,
        data['Jersey Number'] || null,
        data['T-Shirt Size'] || null,
        data['Lower Size'] || null,
        data['Has Cricheroes Profile'] === undefined ? null : data['Has Cricheroes Profile'],
        data['Is Paid Player'] === undefined ? null : data['Is Paid Player'],
        data['Price Per Match'] || null,
        data['Will Join Any Owner'] === undefined ? null : data['Will Join Any Owner'],
        null,
        true,
      ]
    );

    return {
      playerId: result.insertId,
    };
  }

}
