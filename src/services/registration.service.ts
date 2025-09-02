import pool from "../config/db.config";
import { MultiUserRegistrationQueries, RegistrationQueries } from "../queries/registration.queries";
import {
  InitialRegistrationData,
  UpdateProfileSchemaData,
  PlayerExistsSchema,
  AddProfileSchemaData,
  AddProfileExcelSchema,
  IBasicDetails,
} from "../types/player.types";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export class RegistrationService {
  async initialRegistration(data: InitialRegistrationData): Promise<PlayerExistsSchema> {

    const fullMatchQuery = data.email ? RegistrationQueries.findFullMatch : RegistrationQueries.findFullMatchWithNull;
    const fullMatchData = data.email ? [data.mobile, data.email] : [data.mobile]
    const [fullMatches] = await pool.execute<RowDataPacket[]>(
      fullMatchQuery, 
      fullMatchData
    );

    if (fullMatches.length > 0) {
      const player = fullMatches[0];
      return {
        ...(player.isSubmitted !== 1 && { playerId: player.playerId }),
        isRegistered: player.isSubmitted === 1,
      };
    }

    let duplicateMobile = false;
    let duplicateEmail = false;

    const [mobileMatches] = await pool.execute<RowDataPacket[]>(RegistrationQueries.findPlayerByMobile, [data.mobile]);

    if (mobileMatches.length > 0) {
      if (mobileMatches[0].isSubmitted === 1) {
        return {playerId: mobileMatches[0].playerId}
      }
      duplicateMobile = true;
    }

    if (data.email) {
      const [emailMatches] = await pool.execute<RowDataPacket[]>(RegistrationQueries.findPlayerByEmail, [data.email]);

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

    const [result] = await pool.execute<ResultSetHeader>(RegistrationQueries.insertPlayer, [
      data.name,
      data.mobile,
      data.email || null,
      data.state || null,
      data.district || null,
    ]);

    return {
      playerId: result.insertId,
    };
  }

  async addPlayerInformation(data: UpdateProfileSchemaData): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(RegistrationQueries.addPlayerInformation, [
      data.playerId,
      data.jerseyNumber || null,
      data.tShirtSize || null,
      data.lowerSize || null,
      data.hasCricheroesProfile === undefined ? null : data.hasCricheroesProfile,
      data.isPaidPlayer === undefined ? null : data.isPaidPlayer,
      data.pricePerMatch || null,
      data.willJoinAnyOwner === undefined ? null : data.willJoinAnyOwner,
      data.playerRole || null,
      data.battingStyle || null,
      data.bowlingStyle || null,
      data.description || null
    ]);

    if (result.affectedRows > 0) {
      if (data.image) {
        await pool.execute<ResultSetHeader>(RegistrationQueries.updateImage, [data.playerId, data.image, data.image]);
      }

      const [isSubmittedResult] = await pool.execute<ResultSetHeader>(RegistrationQueries.setPlayerSubmitted, [true, data.playerId]);

      if (isSubmittedResult.affectedRows === 0) {
        await pool.execute<ResultSetHeader>(RegistrationQueries.deletePlayerInformation, [data.playerId]);
        return false;
      }
      return true;
    }

    return false;
  }

  async updateProfile(data: UpdateProfileSchemaData): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(RegistrationQueries.updatePlayerInformation, [
      data.playerId,
      data.jerseyNumber || null,
      data.tShirtSize || null,
      data.lowerSize || null,
      data.hasCricheroesProfile === undefined ? null : data.hasCricheroesProfile,
      data.isPaidPlayer === undefined ? null : data.isPaidPlayer,
      data.pricePerMatch || null,
      data.willJoinAnyOwner === undefined ? null : data.willJoinAnyOwner,
       data.playerRole || null,
      data.battingStyle || null,
      data.bowlingStyle || null,
      data.description || null
    ]);

    if (result.affectedRows > 0) {
      if (data.image) {
        await pool.execute<ResultSetHeader>(RegistrationQueries.updateImage, [data.playerId, data.image]);
      }

      const [isSubmittedResult] = await pool.execute<ResultSetHeader>(RegistrationQueries.updatePlayerAddress, [
        data.state || null,
        data.district || null,
        data.playerId,
      ]);

      if (isSubmittedResult.affectedRows === 0) {
        await pool.execute<ResultSetHeader>(RegistrationQueries.deletePlayerInformation, [data.playerId]);
        return false;
      }
      return true;
    }

    return false;
  }

  async isUserProfileSubmitted(playerId: number): Promise<boolean> {
    const [result] = await pool.execute<RowDataPacket[]>(RegistrationQueries.findNotRegisteredUserById, [playerId]);

    return result?.length > 0 ? result[0].count === 1 : false;
  }

  async createProfile(data: AddProfileSchemaData): Promise<PlayerExistsSchema> {
    if (data.email) {
      const [fullMatches] = await pool.execute<RowDataPacket[]>(RegistrationQueries.findFullMatch, [data.mobile, data.email]);
      if (fullMatches.length > 0) {
        return {
          isRegistered: true,
        };
      }
    }

    let duplicateMobile = false;
    let duplicateEmail = false;

    const [mobileMatches] = await pool.execute<RowDataPacket[]>(RegistrationQueries.findPlayerByMobile, [data.mobile]);

    if (mobileMatches.length > 0) {
      duplicateMobile = true;
    }

    if (data.email) {
      const [emailMatches] = await pool.execute<RowDataPacket[]>(RegistrationQueries.findPlayerByEmail, [data.email]);

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

    const [result] = await pool.execute<ResultSetHeader>(RegistrationQueries.createPlayer, [
      data.name,
      data.mobile,
      data.email || null,
      data.state || null,
      data.district || null,
      true,
    ]);

    if (result.affectedRows > 0) {
      await pool.execute<ResultSetHeader>(RegistrationQueries.addPlayerInformation, [
        result.insertId,
        data.jerseyNumber || null,
        data.tShirtSize || null,
        data.lowerSize || null,
        data.hasCricheroesProfile === undefined ? null : data.hasCricheroesProfile,
        data.isPaidPlayer === undefined ? null : data.isPaidPlayer,
        data.pricePerMatch || null,
        data.willJoinAnyOwner === undefined ? null : data.willJoinAnyOwner,
        data.playerRole || null,
        data.battingStyle || null,
        data.bowlingStyle || null,
        data.description || null
      ]);

      return {
        playerId: result.insertId,
      };
    }

    return {
      playerId: 0,
    };
  }

  async deleteProfile(playerId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(RegistrationQueries.deletePlayer, [playerId]);

    return result.affectedRows > 0;
  }

  async deactivatePlayers(playerIds: number[]): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(MultiUserRegistrationQueries.deactivatePlayers(playerIds.join()));

    return result.affectedRows > 0;
  }

  async activatePlayers(playerIds: number[]): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(MultiUserRegistrationQueries.activatePlayers(playerIds.join()));

    return result.affectedRows > 0;
  }

  async updateToNonPlayers(playerIds: number[]): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(MultiUserRegistrationQueries.updateToNonPlayers(playerIds.join()));

    return result.affectedRows > 0;
  }

  async updateToPlayers(playerIds: number[]): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(MultiUserRegistrationQueries.updateToPlayers(playerIds.join()));

    return result.affectedRows > 0;
  }

  async createProfileForExcel(data: AddProfileExcelSchema): Promise<PlayerExistsSchema> {
    if (data["Email"]) {
      const [fullMatches] = await pool.execute<RowDataPacket[]>(RegistrationQueries.findFullMatch, [
        data["Mobile"],
        data["Email"],
      ]);
      if (fullMatches.length > 0) {
        throw new Error("Mobile, Email and Name already exists");
      }
    }

    const [mobileMatches] = await pool.execute<RowDataPacket[]>(RegistrationQueries.findPlayerByMobile, [data["Mobile"]]);

    if (mobileMatches.length > 0) {
      throw new Error("Mobile number already exists");
    }

    if (data["Email"]) {
      const [emailMatches] = await pool.execute<RowDataPacket[]>(RegistrationQueries.findPlayerByEmail, [data["Email"]]);

      if (emailMatches.length > 0) {
        throw new Error("Email already exists");
      }
    }

    const [result] = await pool.execute<ResultSetHeader>(RegistrationQueries.createPlayer, [
      data["Full Name"],
      data["Mobile"],
      data["Email"] || null,
      data["State"] || null,
      data["District"] || null,
      true,
    ]);

    if (result.affectedRows > 0) {
      await pool.execute<ResultSetHeader>(RegistrationQueries.updatePlayerInformation, [
        result.insertId,
        data["Jersey Number"] || null,
        data["T-Shirt Size"] || null,
        data["Lower Size"] || null,
        data["Has Cricheroes Profile"] === undefined ? null : data["Has Cricheroes Profile"],
        data["Is Paid Player"] === undefined ? null : data["Is Paid Player"],
        data["Price Per Match"] || null,
        data["Will Join Any Owner"] === undefined ? null : data["Will Join Any Owner"],
        data["Player Role"] || null,
        data["Batting Style"] || null,
        data["Bowling Style"] || null,
        data["Description"] || null,
      ]);

      return {
        playerId: result.insertId,
      };
    }

    throw new Error("Something happend. Please Try again for this player");
  }

  async updateImageId(fileId: number, playerId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(RegistrationQueries.updateImage, [playerId, fileId, fileId]);
    return result.affectedRows > 0;
  }

    async getPlayerEmailById(playerId: number): Promise<IBasicDetails | null> {
    const [result] = await pool.execute<RowDataPacket[]>(RegistrationQueries.getUserByPlayerId, [playerId]);
    return result?.length > 0 ? result[0] as IBasicDetails : null;
  }
}
