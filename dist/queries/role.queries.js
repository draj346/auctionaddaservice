"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleQueries = void 0;
exports.RoleQueries = {
    findPlayerRoleById: `SELECT r.name 
                        FROM player_role pr 
                        JOIN roles r ON pr.roleId = r.roleId
                        WHERE pr.playerId = ?
                          AND EXISTS (
                            SELECT 1 
                            FROM players p 
                            WHERE p.playerId = pr.playerId 
                              AND p.isActive = 1
                          );`,
    getRoleIdByName: `SELECT roleId from roles WHERE name = ?`,
    deleteRole: `delete from player_role where playerId = ?`,
    setRole: `INSERT INTO player_role (playerId, roleId)
            VALUES (?, ?)`,
};
