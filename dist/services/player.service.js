"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerService = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
const player_queries_1 = require("../queries/player.queries");
class PlayerService {
    async getPlayers(role, userId, page = 1, limit, search = "", approved = "all", sort, active) {
        const offset = (page - 1) * limit;
        const [result, totalResult] = await Promise.all([
            db_config_1.default.execute(player_queries_1.PlayerQueries.getPlayers(role, userId, search, approved, offset, limit, sort, active)),
            db_config_1.default.execute(player_queries_1.PlayerQueries.getPlayersCount(role, userId, search, approved, active)),
        ]);
        const totalPlayers = totalResult[0][0].total;
        const hasMore = offset + limit < totalPlayers;
        return {
            players: result[0].length > 0 ? result[0] : [],
            total: totalPlayers,
            hasMore,
        };
    }
    async getAdmins(page = 1, limit, search = "") {
        const offset = (page - 1) * limit;
        const [result, totalResult] = await Promise.all([
            db_config_1.default.execute(player_queries_1.PlayerQueries.getAdmins(search, offset, limit)),
            db_config_1.default.execute(player_queries_1.PlayerQueries.getAdminsCount(search)),
        ]);
        const totalPlayers = totalResult[0][0].total;
        const hasMore = offset + limit < totalPlayers;
        return {
            players: result[0].length > 0 ? result[0] : [],
            total: totalPlayers,
            hasMore,
        };
    }
    async getPlayerForExport(role, playerIds) {
        const query = player_queries_1.PlayerQueries.getPlayerForExport(role, playerIds);
        const [result] = await db_config_1.default.execute(query);
        return result.length > 0 ? result : [];
    }
    async getPlayerById(role, playerId, isActive, userId) {
        const [result] = await db_config_1.default.execute(player_queries_1.PlayerQueries.getPlayerById(role, playerId, isActive, userId), [userId]);
        return result.length > 0 ? result[0] : null;
    }
    async getImageUrl(fileId) {
        const [result] = await db_config_1.default.execute(player_queries_1.publicPlayerQueries.getFileUrl, [fileId]);
        return result.length > 0 ? result[0].url : "";
    }
    async getPlayerForTeamOwner(userId, auctionId, teamId) {
        const [result] = await db_config_1.default.execute(player_queries_1.publicPlayerQueries.getPlayersForOwner, [userId, auctionId, teamId]);
        return result.length > 0 ? result : [];
    }
    async getPlayerForTeamOwnerByText(userId, teamId, searchText) {
        const [result] = await db_config_1.default.execute(player_queries_1.publicPlayerQueries.getPlayersForOwnerByName, [userId, teamId, searchText]);
        return result.length > 0 ? result : [];
    }
    async getPlayersForAuction(userId, page = 1, limit, search = "", auctionId) {
        const offset = (page - 1) * limit;
        const [result, totalResult] = await Promise.all([
            db_config_1.default.execute(player_queries_1.PlayerQueries.getPlayersForAuction(userId, search, offset, limit, auctionId)),
            db_config_1.default.execute(player_queries_1.PlayerQueries.getPlayersCountForAuction(auctionId, search)),
        ]);
        const totalPlayers = totalResult[0][0].total;
        const hasMore = offset + limit < totalPlayers;
        return {
            players: result[0].length > 0 ? result[0] : [],
            total: totalPlayers,
            hasMore,
        };
    }
    async getAddedPlayersForAuction(userId, page = 1, limit, search = "", auctionId) {
        const offset = (page - 1) * limit;
        const [result, totalResult] = await Promise.all([
            db_config_1.default.execute(player_queries_1.PlayerQueries.getAddedPlayersForAuction(userId, search, offset, limit, auctionId)),
            db_config_1.default.execute(player_queries_1.PlayerQueries.getAddedPlayersCountForAuction(userId, search, offset, limit, auctionId)),
        ]);
        const totalPlayers = totalResult[0][0].total;
        const hasMore = offset + limit < totalPlayers;
        return {
            players: result[0].length > 0 ? result[0] : [],
            total: totalPlayers,
            hasMore,
        };
    }
    async getPlayersForCategory(page = 1, limit, search = "", auctionId) {
        const offset = (page - 1) * limit;
        const [result, totalResult] = await Promise.all([
            db_config_1.default.execute(player_queries_1.PlayerQueries.getPlayersForCategory(search, offset, limit, auctionId)),
            db_config_1.default.execute(player_queries_1.PlayerQueries.getPlayersCountForCategory(auctionId, search)),
        ]);
        const totalPlayers = totalResult[0][0].total;
        const hasMore = offset + limit < totalPlayers;
        return {
            players: result[0].length > 0 ? result[0] : [],
            total: totalPlayers,
            hasMore,
        };
    }
    async getparticipantPlayersForCategory(page = 1, limit, search = "", auctionId, categoryId) {
        const offset = (page - 1) * limit;
        const [result, totalResult] = await Promise.all([
            db_config_1.default.execute(player_queries_1.PlayerQueries.getParticipantPlayersForCategory(search, offset, limit, auctionId, categoryId)),
            db_config_1.default.execute(player_queries_1.PlayerQueries.geParticipantPlayersCountForCategory(auctionId, search, categoryId)),
        ]);
        const totalPlayers = totalResult[0][0].total;
        const hasMore = offset + limit < totalPlayers;
        return {
            players: result[0].length > 0 ? result[0] : [],
            total: totalPlayers,
            hasMore,
        };
    }
    async getparticipantPlayersForTeam(page = 1, limit, search = "", auctionId, teamId) {
        const offset = (page - 1) * limit;
        const [result, totalResult] = await Promise.all([
            db_config_1.default.execute(player_queries_1.PlayerQueries.getParticipantPlayersForTeam(search, offset, limit, auctionId, teamId)),
            db_config_1.default.execute(player_queries_1.PlayerQueries.geParticipantPlayersCountForTeam(auctionId, search, teamId)),
        ]);
        const totalPlayers = totalResult[0][0].total;
        const hasMore = offset + limit < totalPlayers;
        return {
            players: result[0].length > 0 ? result[0] : [],
            total: totalPlayers,
            hasMore,
        };
    }
    async getPlayersForTeams(page = 1, limit, search = "", auctionId) {
        const offset = (page - 1) * limit;
        const [result, totalResult] = await Promise.all([
            db_config_1.default.execute(player_queries_1.PlayerQueries.getPlayersForTeam(search, offset, limit, auctionId)),
            db_config_1.default.execute(player_queries_1.PlayerQueries.getPlayersCountForTeam(auctionId, search)),
        ]);
        const totalPlayers = totalResult[0][0].total;
        const hasMore = offset + limit < totalPlayers;
        return {
            players: result[0].length > 0 ? result[0] : [],
            total: totalPlayers,
            hasMore,
        };
    }
}
exports.PlayerService = PlayerService;
