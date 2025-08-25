import pool from "../config/db.config";
import { PlayerQueries, publicPlayerQueries } from "../queries/player.queries";
import { Player } from "../types/player.types";
import { RowDataPacket } from "mysql2";
import { PlayerRole } from "../constants/roles.constants";
import { AuctionQueries } from "../queries/auction.queries";

export class PlayerService {
  async getPlayers(
    role: PlayerRole,
    userId: number,
    page: number = 1,
    limit: number,
    search: string = "",
    approved: string = "all",
    sort: string,
    active: string
  ): Promise<{ players: Player[]; total: number; hasMore: boolean }> {
    const offset = (page - 1) * limit;

    const [result, totalResult] = await Promise.all([
      pool.execute<RowDataPacket[]>(
        PlayerQueries.getPlayers(role, userId, search, approved, offset, limit, sort, active)
      ),
      pool.execute<RowDataPacket[]>(PlayerQueries.getPlayersCount(role, userId, search, approved, active)),
    ]);

    const totalPlayers = totalResult[0][0].total;
    const hasMore = offset + limit < totalPlayers;

    return {
      players: result[0].length > 0 ? (result[0] as Player[]) : [],
      total: totalPlayers,
      hasMore,
    };
  }

  async getAdmins(
    page: number = 1,
    limit: number,
    search: string = ""
  ): Promise<{ players: Player[]; total: number; hasMore: boolean }> {
    const offset = (page - 1) * limit;

    const [result, totalResult] = await Promise.all([
      pool.execute<RowDataPacket[]>(PlayerQueries.getAdmins(search, offset, limit)),
      pool.execute<RowDataPacket[]>(PlayerQueries.getAdminsCount(search)),
    ]);

    const totalPlayers = totalResult[0][0].total;
    const hasMore = offset + limit < totalPlayers;

    return {
      players: result[0].length > 0 ? (result[0] as Player[]) : [],
      total: totalPlayers,
      hasMore,
    };
  }

  async getPlayerForExport(role: PlayerRole, playerIds: number[]): Promise<Player[]> {
    const query = PlayerQueries.getPlayerForExport(role, playerIds);
    const [result] = await pool.execute<RowDataPacket[]>(query);
    return result.length > 0 ? (result as Player[]) : [];
  }

  async getPlayerById(role: PlayerRole, playerId: number, isActive: boolean, userId: number): Promise<Player | null> {
    const [result] = await pool.execute<RowDataPacket[]>(
      PlayerQueries.getPlayerById(role, playerId, isActive, userId),
      [userId]
    );

    return result.length > 0 ? (result[0] as Player) : null;
  }

  async getImageUrl(fileId: number): Promise<string> {
    const [result] = await pool.execute<RowDataPacket[]>(publicPlayerQueries.getFileUrl, [fileId]);

    return result.length > 0 ? result[0].url : "";
  }

  async getPlayerForTeamOwner(userId: number, auctionId: number, teamId: number): Promise<Player[]> {
    const [result] = await pool.execute<RowDataPacket[]>(publicPlayerQueries.getPlayersForOwner, [userId, auctionId, teamId]);
    return result.length > 0 ? (result as Player[]) : [];
  }

  async getPlayerForTeamOwnerByText(userId: number, teamId: number, searchText: string): Promise<Player[]> {
    const [result] = await pool.execute<RowDataPacket[]>(publicPlayerQueries.getPlayersForOwnerByName, [userId, teamId, searchText]);
    return result.length > 0 ? (result as Player[]) : [];
  }

  async getPlayersForAuction(
    userId: number,
    page: number = 1,
    limit: number,
    search: string = "",
    auctionId: number
  ): Promise<{ players: Player[]; total: number; hasMore: boolean }> {
    const offset = (page - 1) * limit;

    const [result, totalResult] = await Promise.all([
      pool.execute<RowDataPacket[]>(
        PlayerQueries.getPlayersForAuction(userId, search, offset, limit, auctionId)
      ),
      pool.execute<RowDataPacket[]>(PlayerQueries.getPlayersCountForAuction(auctionId, search)),
    ]);

    const totalPlayers = totalResult[0][0].total;
    const hasMore = offset + limit < totalPlayers;

    return {
      players: result[0].length > 0 ? (result[0] as Player[]) : [],
      total: totalPlayers,
      hasMore,
    };
  }

  async getAddedPlayersForAuction(
    userId: number,
    page: number = 1,
    limit: number,
    search: string = "",
    auctionId: number
  ): Promise<{ players: Player[]; total: number; hasMore: boolean }> {
    const offset = (page - 1) * limit;

    const [result, totalResult] = await Promise.all([
      pool.execute<RowDataPacket[]>(
        PlayerQueries.getAddedPlayersForAuction(userId, search, offset, limit, auctionId)
      ),
      pool.execute<RowDataPacket[]>(PlayerQueries.getAddedPlayersCountForAuction(userId, search, offset, limit, auctionId)),
    ]);

    const totalPlayers = totalResult[0][0].total;
    const hasMore = offset + limit < totalPlayers;

    return {
      players: result[0].length > 0 ? (result[0] as Player[]) : [],
      total: totalPlayers,
      hasMore,
    };
  }

  async getPlayersForCategory(
    page: number = 1,
    limit: number,
    search: string = "",
    auctionId: number
  ): Promise<{ players: Player[]; total: number; hasMore: boolean }> {
    const offset = (page - 1) * limit;

    const [result, totalResult] = await Promise.all([
      pool.execute<RowDataPacket[]>(
        PlayerQueries.getPlayersForCategory(search, offset, limit, auctionId)
      ),
      pool.execute<RowDataPacket[]>(
         PlayerQueries.getPlayersCountForCategory(auctionId, search)
      ),
    ]);

    const totalPlayers = totalResult[0][0].total;
    const hasMore = offset + limit < totalPlayers;

    return {
      players: result[0].length > 0 ? (result[0] as Player[]) : [],
      total: totalPlayers,
      hasMore,
    };
  }

  async getparticipantPlayersForCategory(
    page: number = 1,
    limit: number,
    search: string = "",
    auctionId: number,
    categoryId: number
  ): Promise<{ players: Player[]; total: number; hasMore: boolean }> {
    const offset = (page - 1) * limit;

    const [result, totalResult] = await Promise.all([
      pool.execute<RowDataPacket[]>(
        PlayerQueries.getParticipantPlayersForCategory(search, offset, limit, auctionId, categoryId)
      ),
      pool.execute<RowDataPacket[]>(
         PlayerQueries.geParticipantPlayersCountForCategory(auctionId, search, categoryId)
      ),
    ]);

    const totalPlayers = totalResult[0][0].total;
    const hasMore = offset + limit < totalPlayers;

    return {
      players: result[0].length > 0 ? (result[0] as Player[]) : [],
      total: totalPlayers,
      hasMore,
    };
  }

  async getparticipantPlayersForTeam(
    page: number = 1,
    limit: number,
    search: string = "",
    auctionId: number,
    teamId: number
  ): Promise<{ players: Player[]; total: number; hasMore: boolean }> {
    const offset = (page - 1) * limit;

    const [result, totalResult] = await Promise.all([
      pool.execute<RowDataPacket[]>(
        PlayerQueries.getParticipantPlayersForTeam(search, offset, limit, auctionId, teamId)
      ),
      pool.execute<RowDataPacket[]>(
         PlayerQueries.geParticipantPlayersCountForTeam(auctionId, search, teamId)
      ),
    ]);

    const totalPlayers = totalResult[0][0].total;
    const hasMore = offset + limit < totalPlayers;

    return {
      players: result[0].length > 0 ? (result[0] as Player[]) : [],
      total: totalPlayers,
      hasMore,
    };
  }

  async getPlayersForTeams(
    page: number = 1,
    limit: number,
    search: string = "",
    auctionId: number
  ): Promise<{ players: Player[]; total: number; hasMore: boolean }> {
    const offset = (page - 1) * limit;

    const [result, totalResult] = await Promise.all([
      pool.execute<RowDataPacket[]>(
        PlayerQueries.getPlayersForTeam(search, offset, limit, auctionId)
      ),
      pool.execute<RowDataPacket[]>(
         PlayerQueries.getPlayersCountForTeam(auctionId, search)
      ),
    ]);

    const totalPlayers = totalResult[0][0].total;
    const hasMore = offset + limit < totalPlayers;

    return {
      players: result[0].length > 0 ? (result[0] as Player[]) : [],
      total: totalPlayers,
      hasMore,
    };
  }
}
