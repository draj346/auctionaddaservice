import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db.config";
import {
  AuctionPlayer,
  AuctionTeamSummaryData,
  IApprovePlayerForAuction,
  IAssignOwner,
  IAssignWishlist,
  IAuctionCopy,
  IAuctionDetails,
  IAuctionPlayerIdWithName,
  IAuctionStoreProcedureResponse,
  ICategoryDetails,
  ICategoryRule,
  ICreateAuction,
  ICreateCategory,
  ICreateTeam,
  IManageAuction,
  IManageTeam,
  IMyAuctions,
  IRemoveOwner,
  IResetAuctionPlayers,
  ITeamDetails,
  ITeamOwner,
  ITransaction,
  LiveAuctionProps,
  OwnerInformation,
} from "../types/auction.types";
import { AuctionQueries, MultiUserAuctionQueries } from "../queries/auction.queries";
import { FREE_AUCTION_CREATE_LIMIT } from "../config/env";
import { PlayerRole } from "../constants/roles.constants";
import { RoleHelper } from "./../helpers/roles.helpers";

export class AuctionService {
  public static async upsetAuction(auction: ICreateAuction): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(AuctionQueries.upsertAuction, [
      auction.auctionId || null,
      auction.imageId || null,
      auction.name,
      auction.season,
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
      auction.rule,
    ]);

    return result.affectedRows > 0 ? result.insertId : 0;
  }

  public static async updateAuctionCode(code: string, auctionId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(AuctionQueries.updateAuctionCode, [code, auctionId]);

    return result.affectedRows > 0;
  }

  public static async isAuctionInPendingState(playerId: number): Promise<boolean> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.checkAuctionPending, [playerId]);
    return result?.length > 0 ? result[0].count >= FREE_AUCTION_CREATE_LIMIT : false;
  }

  public static async isPaymentDoneForAuction(auctionId: number): Promise<boolean> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.isPaymentDoneForAuction, [auctionId]);
    return result?.length > 0 ? result[0].count === 1 : false;
  }

  public static async getAuctionPlayerId(auctionId: number): Promise<IAuctionPlayerIdWithName | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getAuctionPlayerId, [auctionId]);
    return result?.length > 0 ? (result[0] as IAuctionPlayerIdWithName) : null;
  }

  public static async getLiveAuctionPlayerId(auctionId: number): Promise<IAuctionPlayerIdWithName | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getLiveAuctionPlayerId, [auctionId]);
    return result?.length > 0 ? (result[0] as IAuctionPlayerIdWithName) : null;
  }

  public static async isLiveAuctionAccess(auctionId: number): Promise<IAuctionPlayerIdWithName | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.isAuctionAccess, [auctionId]);
    return result?.length > 0 ? (result[0] as IAuctionPlayerIdWithName) : null;
  }

  public static async getAuctions(playerId: number): Promise<IAuctionDetails[] | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getAuctions, [playerId]);
    return result?.length > 0 ? (result as IAuctionDetails[]) : null;
  }

  public static async getUpcomingAuctions(): Promise<IAuctionDetails[] | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getUpcomingAuctions);
    return result?.length > 0 ? (result as IAuctionDetails[]) : null;
  }

  public static async getLiveAuctions(): Promise<IAuctionDetails[] | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getLiveAuctions);
    return result?.length > 0 ? (result as IAuctionDetails[]) : null;
  }

  public static async getAuctionsForCopy(playerId: number, role: PlayerRole): Promise<IAuctionCopy[] | null> {
    const [result] = await pool.execute<RowDataPacket[]>(
      RoleHelper.isAdminAndAbove(role) ? AuctionQueries.getAuctionForCopyForAdmin : AuctionQueries.getAuctionForCopy,
      [playerId]
    );
    return result?.length > 0 ? (result as IAuctionCopy[]) : null;
  }

  public static async updateAuctionCompletionStatus(auctionId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(AuctionQueries.updateAuctionCompletionStatus, [auctionId]);
    return result.affectedRows > 0;
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

  public static async isValidAuctionPlayerIdForEdit(acutionId: number): Promise<number | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.isValidAuctionPlayerIdForEdit, [acutionId]);
    return result?.length > 0 ? result[0].playerId : null;
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

  public static async copyAuctionById(
    auctionId: number,
    playerId: number,
    isAdmin: boolean,
    teamLimit: number
  ): Promise<IAuctionStoreProcedureResponse | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.copyAuctionById, [
      auctionId,
      playerId,
      isAdmin,
      teamLimit,
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
    const [[result], [ownerResult]] = await Promise.all([
      pool.execute<RowDataPacket[]>(AuctionQueries.getTeamsByAuctionId, [auctionId]),
      pool.execute<RowDataPacket[]>(AuctionQueries.getFirstOwnerByAuctionId, [auctionId]),
    ]);
    
    const ownerMap: Record<number, string> = {};
    if (ownerResult?.length > 0 ) {
      const updatedOwnerResult = ownerResult as { name: string; teamId: number }[];
      updatedOwnerResult.forEach(owner => {
        ownerMap[owner.teamId] = owner.name;
      });
    }

    if (result?.length > 0) {
      const updatedResult = result as ITeamDetails[];
      const teamsWithOwners = updatedResult.map(team => {
      return {
        ...team,
        ownerName: ownerMap[team.teamId] || ''
      };
    });
    return teamsWithOwners;
    }

    return null;
  }

  public static async getTeamById(auctionId: number, teamId: number): Promise<ITeamDetails | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getTeamsById, [auctionId, teamId]);
    return result?.length > 0 ? (result[0] as ITeamDetails) : null;
  }

  public static async deleteTeamsById(
    teamId: number,
    isAdminAndAbove: boolean,
    playerId: number,
    auctionId: number
  ): Promise<IAuctionStoreProcedureResponse | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.deleteTeamsById, [
      teamId,
      isAdminAndAbove,
      playerId,
      auctionId,
    ]);
    return result?.length > 0 ? (result[0][0].result as IAuctionStoreProcedureResponse) : null;
  }

  public static async getTeamCount(auctionId: number): Promise<number> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getTeamCount, [auctionId]);
    return result?.length > 0 ? result[0].count : 0;
  }

  public static async getTeamPlayerCount(auctionId: number): Promise<number> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getPlayerCountForTeam, [auctionId]);
    return result?.length > 0 ? result[0].count : 0;
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

  public static async removeOwnerFromTeam(data: IRemoveOwner): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(AuctionQueries.removeOwnerFromTeam, [
      data.teamId,
      data.ownerId,
      data.auctionId,
    ]);

    return result.affectedRows > 0;
  }

  public static async upsetCategory(category: ICreateCategory): Promise<number> {
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
      category.increments ? JSON.stringify(category.increments) : null,
    ]);

    return result.affectedRows > 0 ? result.insertId : 0;
  }

  public static async getCategoriesByAuctionId(auctionId: number): Promise<ICategoryDetails[] | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getCategoriesByAuctionId, [auctionId]);
    return result?.length > 0 ? (result as ICategoryDetails[]) : null;
  }

  public static async getCategoryById(auctionId: number, categoryId: number): Promise<ICategoryDetails | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getCategoriesById, [auctionId, categoryId]);
    return result?.length > 0 ? (result[0] as ICategoryDetails) : null;
  }

  public static async getPlayerByCategoryId(auctionId: number, categoryId: number): Promise<number[] | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getPlayerByCategoryId, [categoryId, auctionId]);
    return result?.length > 0 ? (result[0] as number[]) : null;
  }

  public static async deleteCategoryById(
    categoryId: number,
    isAdminAndAbove: boolean,
    playerId: number,
    auctionId: number
  ): Promise<IAuctionStoreProcedureResponse | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.deleteCategoryById, [
      categoryId,
      isAdminAndAbove,
      playerId,
      auctionId,
    ]);
    return result?.length > 0 ? (result[0][0].result as IAuctionStoreProcedureResponse) : null;
  }

  public static async updatePlayerToAuction(
    playerInfo: IManageAuction
  ): Promise<IAuctionStoreProcedureResponse | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.updatePlayerToAuction, [
      playerInfo.operation,
      playerInfo.auctionId,
      playerInfo.categoryId || null,
      JSON.stringify(playerInfo.playerIds),
      playerInfo.baseBid || null,
      playerInfo.isApproved || false,
      playerInfo.fileId || null,
    ]);
    return result?.length > 0 ? (result[0][0].result as IAuctionStoreProcedureResponse) : null;
  }

  public static async updatePlayerToTeam(playerInfo: IManageTeam): Promise<IAuctionStoreProcedureResponse | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.updatePlayerToTeam, [
      playerInfo.operation,
      playerInfo.auctionId,
      playerInfo.teamId,
      JSON.stringify(playerInfo.playerIds),
      playerInfo.price || null,
      playerInfo.requesterId,
      playerInfo.isAdmin,
    ]);
    return result?.length > 0 ? (result[0][0].result as IAuctionStoreProcedureResponse) : null;
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

  public static async approvePlayerToAuction(playerInfo: IApprovePlayerForAuction): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      MultiUserAuctionQueries.approvePlayerToAuction(playerInfo.playerIds.join(), playerInfo.auctionId)
    );
    return result.affectedRows > 0;
  }

  public static async starPlayerForAuction(playerInfo: IApprovePlayerForAuction): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      MultiUserAuctionQueries.starPlayerForAuction(playerInfo.playerIds.join(), playerInfo.auctionId)
    );
    return result.affectedRows > 0;
  }

  public static async unStarPlayerForAuction(playerInfo: IApprovePlayerForAuction): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      MultiUserAuctionQueries.unStarPlayerForAuction(playerInfo.playerIds.join(), playerInfo.auctionId)
    );
    return result.affectedRows > 0;
  }

  public static async getTeamOwnerInfo(teamId: number): Promise<ITeamOwner[] | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getTeamOwnerInfo, [teamId]);
    return result?.length > 0 ? (result as ITeamOwner[]) : null;
  }

  public static async getPendingPlayerCountForAuction(auctionId: number): Promise<number> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getCountAuctionPlayersPending, [auctionId]);
    return result?.length > 0 ? result[0].total : 0;
  }

  public static async getTeamPlayerCountByTeamId(auctionId: number, teamId: number): Promise<number> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getTeamPlayerCountById, [auctionId, teamId]);
    return result?.length > 0 ? result[0].total : 0;
  }

  public static async getAuctionDetailsByCode(code: string, userId: number): Promise<IAuctionDetails | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getAuctionDetailByCode, [code]);

    if (result?.length > 0) {
      const auctionDetails = result[0] as IAuctionDetails;
      const [joinAuctionStatus] = await pool.execute<RowDataPacket[]>(AuctionQueries.getAuctionStatusForJoin, [
        userId,
        auctionDetails.auctionId,
      ]);

      if (joinAuctionStatus?.length > 0) {
        auctionDetails.status = true;
        auctionDetails.isApproved = joinAuctionStatus[0].isApproved;

        return auctionDetails;
      } else {
        auctionDetails.status = false;
        auctionDetails.isApproved = false;

        return auctionDetails;
      }
    }

    return null;
  }

  public static async getMyAuctions(userId: number): Promise<IMyAuctions[] | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getMyAuctions, [userId]);
    return result?.length > 0 ? (result as IMyAuctions[]) : null;
  }

  public static async getTeamByAuctionId(auctionId: number): Promise<AuctionTeamSummaryData[] | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getTeamByAuctionId, [auctionId]);
    return result?.length > 0 ? (result as AuctionTeamSummaryData[]) : null;
  }

  public static async getTeamByTeamId(auctionId: number, teamId: number): Promise<AuctionTeamSummaryData | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getTeamByTeamId, [auctionId, teamId]);
    return result?.length > 0 ? (result[0] as AuctionTeamSummaryData) : null;
  }

  public static async getOwnerByAuctionId(auctionId: number): Promise<OwnerInformation[] | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getOwnerByAuctionId, [auctionId]);
    return result?.length > 0 ? (result as OwnerInformation[]) : null;
  }

  public static async getOwnerByTeamId(teamId: number): Promise<OwnerInformation[] | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getOwnerByTeamId, [teamId]);
    return result?.length > 0 ? (result as OwnerInformation[]) : null;
  }

  public static async getAuctionPlayers(auctionId: number): Promise<AuctionPlayer[] | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getPlayersByAuctionId, [auctionId]);
    return result?.length > 0 ? (result as AuctionPlayer[]) : null;
  }

  public static async getAuctionTeamPlayers(auctionId: number, teamId: number): Promise<AuctionPlayer[] | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getPlayersByTeamId, [auctionId, teamId]);
    return result?.length > 0 ? (result as AuctionPlayer[]) : null;
  }

  public static async getAuctionInfo(auctionId: number): Promise<LiveAuctionProps | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.getAuctionInfo, [auctionId]);
    return result?.length > 0 ? (result[0] as LiveAuctionProps) : null;
  }

  public static async updatePlayerAuctionStatus(status: string, auctionId: number, playerId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(AuctionQueries.updatePlayerStatus, [
      status,
      auctionId,
      playerId,
    ]);

    return result.affectedRows > 0;
  }

  public static async resetAuctionPlayers(
    auctionInfo: IResetAuctionPlayers
  ): Promise<IAuctionStoreProcedureResponse | null> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.resetAuctionPlayers, [
      auctionInfo.auctionId,
      auctionInfo.requesterId,
      auctionInfo.isAdmin,
    ]);
    return result?.length > 0 ? (result[0][0].result as IAuctionStoreProcedureResponse) : null;
  }

  public static async reauctionUnsoldPlayer(auctionId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(AuctionQueries.reauctionUnsoldPlayer, [auctionId]);

    return result.affectedRows > 0;
  }

  public static async updatePlayerOrder(auctionId: number, orderType: string): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(AuctionQueries.updatePlayerOrder, [orderType.toUpperCase(), auctionId]);
    return result.affectedRows > 0;
  }

  public static async updateLiveAuctionMode(auctionId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(AuctionQueries.updateAuctionMode, [auctionId]);
    return result.affectedRows > 0;
  }

  public static async isOwnerByAuctionId(auctionId: number, userId: number): Promise<boolean> {
    const [result] = await pool.execute<RowDataPacket[]>(AuctionQueries.checkOwnerAccess, [auctionId, userId]);
    return result?.length > 0 ? (result[0].isOwner === 1) : false
  }
}
