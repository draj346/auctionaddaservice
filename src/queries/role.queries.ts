export const RoleQueries = {
  findPlayerRoleById: `SELECT r.name 
                        FROM player_role pr 
                        JOIN roles r ON pr.roleId = r.roleId
                        WHERE pr.playerId = ?
                          AND EXISTS (
                            SELECT 1 
                            FROM players p 
                            WHERE p.playerId = pr.playerId 
                              AND p.isActive = 1
                          );`
};
