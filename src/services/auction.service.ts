import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db.config";
import {
  IAssignOwner,
  IAssignWishlist,
  IAuctionDetails,
  IAuctionPlayerIdWithName,
  IAuctionStoreProcedureResponse,
  ICategoryDetails,
  ICategoryRule,
  ICreateAuction,
  ICreateCategory,
  ICreateTeam,
  IManageAuction,
  ITeamDetails,
  ITransaction,
} from "../types/auction.types";
import { AuctionQueries } from "../queries/auction.queries";
import { FREE_AUCTION_CREATE_LIMIT } from "../config/env";
import { json } from "stream/consumers";

export class AuctionService {
  public static async upsetAuction(auction: ICreateAuction): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(AuctionQueries.upsertAuction, [
      auction.auctionId || null,
      auction.imageId || null,
      auction.name,
      auction.state,
      auction.district,
      auction.startDate,
      auction.startTime,
      auction.maxPlayerPerTeam,
      auction.minPlayerPerTeam || 0,
      auction.playerId,
      auction.pointPerTeam,
      auction.baseBid,
      auction.baseIncreaseBy,
      auction.isPaymentInCompanyAccount,
      auction.qrCodeId || null,
      auction.rule
    ]);

    return result.affectedRows > 0  ? result.insertId : 0;
  }

   public static async updateAuctionCode(code: string, auctionId: number): Promise<boolean> {
     const [result] = await pool.execute<ResultSetHeader>(AuctionQueries.updateAuctionCode, [
      code,
      auctionId
    ]);

    return result.affectedRows > 0;
  }

  public static async isAuctionInPendingState(playerId: number): Promise<boolean> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.checkAuctionPending, [playerId]);
    return result?.length > 0 ? result[0].count === FREE_AUCTION_CREATE_LIMIT : false;
  }

  public static async getAuctionPlayerId(auctionId: number): Promise<IAuctionPlayerIdWithName | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getAuctionPlayerId, [auctionId]);
    return result?.length > 0 ? result[0] as IAuctionPlayerIdWithName : null;
  }

  public static async getAuctions(playerId: number): Promise<IAuctionDetails[] | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getAuctions, [playerId]);
    return result?.length > 0 ? (result as IAuctionDetails[]) : null;
  }

  public static async approveAuction(auctionId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(AuctionQueries.approveAuction, [auctionId]);
    return result.affectedRows > 0;
  }

  public static async getAuctionName(auctionId: number): Promise<IAuctionDetails | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getAuctionName, [auctionId]);
    return result?.length > 0 ? (result[0] as IAuctionDetails) : null;
  }

  public static async isValidAuctionForAccess(acutionId: number, playerId: number): Promise<boolean> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.isValidAuction, [acutionId, playerId]);
    return result?.length > 0 ? result[0].count === 1 : false;
  }

  public static async getAuctionDetails(auctionId: number): Promise<IAuctionDetails | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getAuctionDetails, [auctionId]);
    return result?.length > 0 ? (result[0] as IAuctionDetails) : null;
  }

  public static async getAuctionDetailsbySearch(search: string): Promise<IAuctionDetails[] | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getAuctionSearchByAdmin, [search, search]);
    return result?.length > 0 ? (result as IAuctionDetails[]) : null;
  }

  public static async deleteAuctionById(
    auctionId: number,
    playerId: number,
    isAdmin: boolean
  ): Promise<IAuctionStoreProcedureResponse | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.deleteAuctionById, [
      auctionId,
      playerId,
      isAdmin,
    ]);
    return result?.length > 0 ? (result[0][0].result as IAuctionStoreProcedureResponse) : null;
  }

  public static async isOrganiser(playerId: number): Promise<boolean> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.isOrganiser, [playerId]);
    return result?.length > 0 ? result[0].count > 0 : false;
  }

  public static async updateCategory(rule: ICategoryRule): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(AuctionQueries.updateCatergoryRule, [
      rule.defCategoryDisplayOrderId,
      rule.players_selection_rule,
      rule.auctionId,
    ]);

    return result.affectedRows > 0;
  }

  public static async upsetTransaction(transaction: ITransaction): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(AuctionQueries.upsetTransaction, [
      transaction.auctionId,
      transaction.amount,
      transaction.transactionId,
      transaction.status,
    ]);

    return result.affectedRows > 0;
  }

  public static async upsetTeam(team: ICreateTeam): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(AuctionQueries.upsetTeam, [
      team.teamId || null,
      team.name,
      team.shortName,
      team.image,
      team.shortcutKey,
      team.auctionId,
    ]);

    return result.affectedRows > 0;
  }

  public static async getTeamsByAuctionId(auctionId: number): Promise<ITeamDetails[] | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getTeamsByAuctionId, [auctionId]);
    return result?.length > 0 ? (result[0] as ITeamDetails[]) : null;
  }

  public static async deleteTeamsById(teamId: number): Promise<IAuctionStoreProcedureResponse | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.deleteTeamsById, [teamId]);
    return result?.length > 0 ? (result[0].result as IAuctionStoreProcedureResponse) : null;
  }

  public static async assignOwnerToTeam(team: IAssignOwner): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(AuctionQueries.assignOwnerToTeam, [
      team.auctionId,
      team.teamId,
      team.ownerId,
      team.tag,
    ]);

    return result.affectedRows > 0;
  }

  public static async removeOwnerFromTeam(teamId: number, ownerId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(AuctionQueries.removeOwnerFromTeam, [teamId, ownerId]);

    return result.affectedRows > 0;
  }

  public static async upsetCategory(category: ICreateCategory): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(AuctionQueries.upsetCategory, [
      category.categoryId || null,
      category.auctionId,
      category.name,
      category.maxPlayer,
      category.minPlayer || 0,
      category.baseBid,
      category.reserveBid,
      category.highestBid,
      category.categoryHighestBid,
      JSON.stringify(category.increments),
    ]);

    return result.affectedRows > 0;
  }

  public static async getCategoriesByAuctionId(auctionId: number): Promise<ICategoryDetails[] | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getCategoriesByAuctionId, [auctionId]);
    return result?.length > 0 ? (result[0] as ICategoryDetails[]) : null;
  }

  public static async getPlayerByCategoryId(auctionId: number, categoryId: number): Promise<number[] | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getPlayerByCategoryId, [categoryId, auctionId]);
    return result?.length > 0 ? (result[0] as number[]) : null;
  }

  public static async deleteCategoryById(categoryId: number): Promise<IAuctionStoreProcedureResponse | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.deleteCategoryById, [categoryId]);
    return result?.length > 0 ? (result[0].result as IAuctionStoreProcedureResponse) : null;
  }

  public static async updatePlayerToAuction(
    playerInfo: IManageAuction
  ): Promise<IAuctionStoreProcedureResponse | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.updatePlayerToAuction, [
      playerInfo.operation,
      playerInfo.auctionId,
      playerInfo.categoryId,
      JSON.stringify(playerInfo.playerIds),
    ]);
    return result?.length > 0 ? (result[0].result as IAuctionStoreProcedureResponse) : null;
  }

  public static async upsetWishlist(wishlist: IAssignWishlist): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(AuctionQueries.upsetWishlist, [
      wishlist.id || null,
      wishlist.teamId,
      wishlist.auctionId,
      wishlist.playerId,
      wishlist.tag || "Player",
    ]);

    return result.affectedRows > 0;
  }

  public static async deleteFromWhislist(teamId: number, playerId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(AuctionQueries.deleteFromWhislist, [teamId, playerId]);

    return result.affectedRows > 0;
  }
}
