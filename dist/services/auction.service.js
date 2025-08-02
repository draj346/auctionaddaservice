"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionService = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
const auction_queries_1 = require("../queries/auction.queries");
const env_1 = require("../config/env");
const roles_helpers_1 = require("./../helpers/roles.helpers");
class AuctionService {
    static async upsetAuction(auction) {
        const [result] = await db_config_1.default.execute(auction_queries_1.AuctionQueries.upsertAuction, [
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
    static async updateAuctionCode(code, auctionId) {
        const [result] = await db_config_1.default.execute(auction_queries_1.AuctionQueries.updateAuctionCode, [code, auctionId]);
        return result.affectedRows > 0;
    }
    static async isAuctionInPendingState(playerId) {
        const [result] = await db_config_1.default.execute(auction_queries_1.AuctionQueries.checkAuctionPending, [playerId]);
        return result?.length > 0 ? result[0].count >= env_1.FREE_AUCTION_CREATE_LIMIT : false;
    }
    static async getAuctionPlayerId(auctionId) {
        const [result] = await db_config_1.default.execute(auction_queries_1.AuctionQueries.getAuctionPlayerId, [auctionId]);
        return result?.length > 0 ? result[0] : null;
    }
    static async getAuctions(playerId) {
        const [result] = await db_config_1.default.execute(auction_queries_1.AuctionQueries.getAuctions, [playerId]);
        return result?.length > 0 ? result : null;
    }
    static async getAuctionsForCopy(playerId, role) {
        const [result] = await db_config_1.default.execute(roles_helpers_1.RoleHelper.isAdminAndAbove(role) ? auction_queries_1.AuctionQueries.getAuctionForCopyForAdmin : auction_queries_1.AuctionQueries.getAuctionForCopy, [playerId]);
        return result?.length > 0 ? result : null;
    }
    static async updateAuctionCompletionStatus(auctionId) {
        const [result] = await db_config_1.default.execute(auction_queries_1.AuctionQueries.updateAuctionCompletionStatus, [auctionId]);
        return result.affectedRows > 0;
    }
    static async approveAuction(auctionId) {
        const [result] = await db_config_1.default.execute(auction_queries_1.AuctionQueries.approveAuction, [auctionId]);
        return result.affectedRows > 0;
    }
    static async getAuctionName(auctionId) {
        const [result] = await db_config_1.default.execute(auction_queries_1.AuctionQueries.getAuctionName, [auctionId]);
        return result?.length > 0 ? result[0] : null;
    }
    static async isValidAuctionForAccess(acutionId, playerId) {
        const [result] = await db_config_1.default.execute(auction_queries_1.AuctionQueries.isValidAuction, [acutionId, playerId]);
        return result?.length > 0 ? result[0].count === 1 : false;
    }
    static async getAuctionDetails(auctionId) {
        const [result] = await db_config_1.default.execute(auction_queries_1.AuctionQueries.getAuctionDetails, [auctionId]);
        return result?.length > 0 ? result[0] : null;
    }
    static async getAuctionDetailsbySearch(search) {
        const [result] = await db_config_1.default.execute(auction_queries_1.AuctionQueries.getAuctionSearchByAdmin, [search, search]);
        return result?.length > 0 ? result : null;
    }
    static async deleteAuctionById(auctionId, playerId, isAdmin) {
        const [result] = await db_config_1.default.execute(auction_queries_1.AuctionQueries.deleteAuctionById, [
            auctionId,
            playerId,
            isAdmin,
        ]);
        return result?.length > 0 ? result[0][0].result : null;
    }
    static async copyAuctionById(auctionId, playerId, isAdmin) {
        const [result] = await db_config_1.default.execute(auction_queries_1.AuctionQueries.copyAuctionById, [
            auctionId,
            playerId,
            isAdmin,
        ]);
        return result?.length > 0 ? result[0][0].result : null;
    }
    static async isOrganiser(playerId) {
        const [result] = await db_config_1.default.execute(auction_queries_1.AuctionQueries.isOrganiser, [playerId]);
        return result?.length > 0 ? result[0].count > 0 : false;
    }
    static async updateCategory(rule) {
        const [result] = await db_config_1.default.execute(auction_queries_1.AuctionQueries.updateCatergoryRule, [
            rule.defCategoryDisplayOrderId,
            rule.players_selection_rule,
            rule.auctionId,
        ]);
        return result.affectedRows > 0;
    }
    static async upsetTransaction(transaction) {
        const [result] = await db_config_1.default.execute(auction_queries_1.AuctionQueries.upsetTransaction, [
            transaction.auctionId,
            transaction.amount,
            transaction.transactionId,
            transaction.status,
        ]);
        return result.affectedRows > 0;
    }
    static async upsetTeam(team) {
        const [result] = await db_config_1.default.execute(auction_queries_1.AuctionQueries.upsetTeam, [
            team.teamId || null,
            team.name,
            team.shortName,
            team.image,
            team.shortcutKey,
            team.auctionId,
        ]);
        return result.affectedRows > 0;
    }
    static async getTeamsByAuctionId(auctionId) {
        const [result] = await db_config_1.default.execute(auction_queries_1.AuctionQueries.getTeamsByAuctionId, [auctionId]);
        return result?.length > 0 ? result[0] : null;
    }
    static async deleteTeamsById(teamId) {
        const [result] = await db_config_1.default.execute(auction_queries_1.AuctionQueries.deleteTeamsById, [teamId]);
        return result?.length > 0 ? result[0].result : null;
    }
    static async assignOwnerToTeam(team) {
        const [result] = await db_config_1.default.execute(auction_queries_1.AuctionQueries.assignOwnerToTeam, [
            team.auctionId,
            team.teamId,
            team.ownerId,
            team.tag,
        ]);
        return result.affectedRows > 0;
    }
    static async removeOwnerFromTeam(teamId, ownerId) {
        const [result] = await db_config_1.default.execute(auction_queries_1.AuctionQueries.removeOwnerFromTeam, [teamId, ownerId]);
        return result.affectedRows > 0;
    }
    static async upsetCategory(category) {
        const [result] = await db_config_1.default.execute(auction_queries_1.AuctionQueries.upsetCategory, [
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
    static async getCategoriesByAuctionId(auctionId) {
        const [result] = await db_config_1.default.execute(auction_queries_1.AuctionQueries.getCategoriesByAuctionId, [auctionId]);
        return result?.length > 0 ? result[0] : null;
    }
    static async getPlayerByCategoryId(auctionId, categoryId) {
        const [result] = await db_config_1.default.execute(auction_queries_1.AuctionQueries.getPlayerByCategoryId, [categoryId, auctionId]);
        return result?.length > 0 ? result[0] : null;
    }
    static async deleteCategoryById(categoryId) {
        const [result] = await db_config_1.default.execute(auction_queries_1.AuctionQueries.deleteCategoryById, [categoryId]);
        return result?.length > 0 ? result[0].result : null;
    }
    static async updatePlayerToAuction(playerInfo) {
        const [result] = await db_config_1.default.execute(auction_queries_1.AuctionQueries.updatePlayerToAuction, [
            playerInfo.operation,
            playerInfo.auctionId,
            playerInfo.categoryId,
            JSON.stringify(playerInfo.playerIds),
        ]);
        return result?.length > 0 ? result[0].result : null;
    }
    static async upsetWishlist(wishlist) {
        const [result] = await db_config_1.default.execute(auction_queries_1.AuctionQueries.upsetWishlist, [
            wishlist.id || null,
            wishlist.teamId,
            wishlist.auctionId,
            wishlist.playerId,
            wishlist.tag || "Player",
        ]);
        return result.affectedRows > 0;
    }
    static async deleteFromWhislist(teamId, playerId) {
        const [result] = await db_config_1.default.execute(auction_queries_1.AuctionQueries.deleteFromWhislist, [teamId, playerId]);
        return result.affectedRows > 0;
    }
}
exports.AuctionService = AuctionService;
