"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerService = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
const player_queries_1 = require("../queries/player.queries");
class PlayerService {
    async getPlayers(role, userId, page = 1, limit, search = "", owner = "all", approved = "all", sort, isActive = true) {
        const offset = (page - 1) * limit;
        const [result, totalResult] = await Promise.all([
            db_config_1.default.execute(player_queries_1.PlayerQueries.getPlayers(role, isActive, userId, search, owner, approved, offset, limit, sort)),
            db_config_1.default.execute(player_queries_1.PlayerQueries.getPlayersCount(role, isActive, userId, search, owner, approved)),
        ]);
        const totalPlayers = totalResult[0][0].total;
        const hasMore = offset + limit < totalPlayers;
        return {
            players: result[0].length > 0 ? result[0] : [],
            total: totalPlayers,
            hasMore
        };
    }
    async getPlayerForExport(playerIds) {
        const query = player_queries_1.PlayerQueries.getPlayerForExport(playerIds);
        const [result] = await db_config_1.default.execute(query);
        return result.length > 0 ? result : [];
    }
    async getPlayerById(req, playerId) {
        const [result] = await db_config_1.default.execute(player_queries_1.PlayerQueries.getPlayerById(req.role, playerId), [req.userId]);
        return result.length > 0 ? result : [];
    }
}
exports.PlayerService = PlayerService;
