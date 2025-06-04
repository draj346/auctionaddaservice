export const AuthQueries = {
  findPlayerByIdentifier: `SELECT playerId, password FROM players WHERE email = ? OR mobile = ?`,
  findSubmittedPlayerByIdentifier: `SELECT playerId, password FROM players WHERE (email = ? OR mobile = ?) AND isSubmitted = ?`,
  findPlayerCountById: `SELECT count(*) as count FROM players WHERE playerId = ?`,
  updatePassword: `UPDATE players SET password = ? WHERE playerId = ?`,
};
