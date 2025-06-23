"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthQueries = void 0;
exports.AuthQueries = {
    findPlayerByIdentifier: `SELECT playerId, password FROM players WHERE (email = ? OR mobile = ?) AND isActive = 1`,
    findSubmittedPlayerByIdentifier: `SELECT p.playerId, p.password, f.url as image FROM players p  
                                    LEFT JOIN files f ON p.image = f.fileId
                                    WHERE (p.email = ? OR p.mobile = ?) AND p.isSubmitted = ? AND p.isActive = 1`,
    findPlayerCountById: `SELECT count(*) as count FROM players WHERE playerId = ? AND isActive = ?`,
    updatePassword: `UPDATE players SET password = ? WHERE playerId = ?`,
    findLoggedInPlayerCountById: `SELECT count(*) as count FROM players WHERE playerId = ? AND isActive = 1 AND isSubmitted = 1`
};
