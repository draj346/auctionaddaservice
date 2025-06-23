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
    getAdminRole: `SELECT roleId FROM roles WHERE name = 'ADMIN'`,
    setRole: `INSERT INTO player_role (playerId, roleId)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE playerId = playerId`,
    deleteRole: `delete from player_role where playerId = ?`,
    updatePlayerForAdmin: `update players set isNonPlayer = 1, isApproved = 1 where playerId = ?`,
};
