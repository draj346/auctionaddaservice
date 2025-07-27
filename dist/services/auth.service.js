"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
const auth_queries_1 = require("../queries/auth.queries");
const encryption_1 = require("../utils/encryption");
class AuthService {
    static async verifyPlayerById(playerId) {
        const [result] = await db_config_1.default.execute(auth_queries_1.GuestAuthQueries.findPlayerCountById, [playerId]);
        return result?.length > 0 ? result[0].count === 1 : false;
    }
    static async verifyPlayerByIdentifier(identifier) {
        const [result] = await db_config_1.default.execute(auth_queries_1.GuestAuthQueries.findPlayerCountByIdentifier, [
            identifier,
            identifier,
        ]);
        return result?.length > 0 ? result[0].count === 1 : false;
    }
    static async getPlayerIdByIdentifier(identifier) {
        const [result] = await db_config_1.default.execute(auth_queries_1.GuestAuthQueries.findPlayerIdByIdentifier, [
            identifier,
            identifier,
        ]);
        return result?.length > 0 ? result[0] : null;
    }
    static async getPlayerImageByPlayerId(playerId) {
        const [result] = await db_config_1.default.execute(auth_queries_1.GuestAuthQueries.getImageByIdentifier, [playerId]);
        return result?.length > 0 ? result[0].url : null;
    }
    static async getPasswordByPlayerId(playerId) {
        const [result] = await db_config_1.default.execute(auth_queries_1.GuestAuthQueries.getPassword, [playerId]);
        return result?.length > 0 ? result[0] : null;
    }
    static async updatePassword(playerId, password) {
        const hashedPassword = await (0, encryption_1.encryptPassword)(password);
        const [result] = await db_config_1.default.execute(auth_queries_1.GuestAuthQueries.updatePassword, [playerId, hashedPassword]);
        return result.affectedRows > 0;
    }
}
exports.AuthService = AuthService;
_a = AuthService;
// This will be used before login. Without checking isSubmitted True
AuthService.isValidUser = async (playerId, emailOrPhone) => {
    try {
        if (playerId) {
            return await _a.verifyPlayerById(playerId);
        }
        else if (emailOrPhone) {
            return await _a.verifyPlayerByIdentifier(emailOrPhone);
        }
        return false;
    }
    catch (error) {
        return false;
    }
};
AuthService.isValidLoggedInUser = async (playerId) => {
    const [result] = await db_config_1.default.execute(auth_queries_1.AuthQueries.findLoggedInPlayerCountById, [playerId]);
    return result?.length > 0 ? result[0].count === 1 : false;
};
