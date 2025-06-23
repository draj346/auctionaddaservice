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
        const [result] = await db_config_1.default.execute(auth_queries_1.AuthQueries.findPlayerCountById, [playerId, '1']);
        return result?.length > 0 ? result[0].count === 1 : false;
    }
    static async verifyPlayerByIdentifier(identifier, isSubmitted = false) {
        const query = isSubmitted ? auth_queries_1.AuthQueries.findSubmittedPlayerByIdentifier : auth_queries_1.AuthQueries.findPlayerByIdentifier;
        const parameter = isSubmitted ? [identifier, identifier, 1] : [identifier, identifier];
        const [result] = await db_config_1.default.execute(query, parameter);
        return result?.length > 0 ? result[0] : null;
    }
    static async updatePassword(playerId, password) {
        const hashedPassword = await (0, encryption_1.encryptPassword)(password);
        const [result] = await db_config_1.default.execute(auth_queries_1.AuthQueries.updatePassword, [hashedPassword, playerId]);
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
            const result = await _a.verifyPlayerByIdentifier(emailOrPhone);
            return result ? true : false;
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
