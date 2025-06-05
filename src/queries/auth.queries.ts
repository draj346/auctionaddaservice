export const AuthQueries = {
  findPlayerByIdentifier: `SELECT playerId, password FROM players WHERE (email = ? OR mobile = ?) AND isActive = 1`,
  findSubmittedPlayerByIdentifier: `SELECT playerId, password FROM players WHERE (email = ? OR mobile = ?) AND isSubmitted = ? AND isActive = 1`,
  findPlayerCountById: `SELECT count(*) as count FROM players WHERE playerId = ? AND isActive = ?`,
  updatePassword: `UPDATE players SET password = ? WHERE playerId = ?`,
  findLoggedInPlayerCountById: `SELECT count(*) as count FROM players WHERE playerId = ? AND isActive = 1 AND isSubmitted = 1`

};
