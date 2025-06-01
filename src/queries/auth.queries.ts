export const AuthQueries = {
  findPlayerByIdentifier: `SELECT playerId FROM players WHERE email = ? OR mobile = ?`,
  findPlayerById: `SELECT count(*) as count FROM players WHERE playerId = ?`
};