export const PlayerQueries = {
  findPlayerByMobile: `SELECT playerId FROM players WHERE mobile = ?`,
  insertPlayer: `INSERT INTO players (name, mobile, email) VALUES (?, ?, ?)`,
  updatePlayer: `
    UPDATE players SET 
      jerseyNumber = ?,
      tShirtSize = ?,
      lowerSize = ?,
      hasCricheroesProfile = ?,
      isPaidPlayer = ?,
      pricePerMatch = ?,
      willJoinAnyOwner = ?,
      isSubmitted = ?,
      isNonPlayer = ?,
      isOwner = ?,
      isAdmin = ?
    WHERE playerId = ?`,
  updateImage: `UPDATE players SET image = ? WHERE playerId = ?`,
  getPlayers: `SELECT playerId, name, email FROM players`,
  findPlayerByIdentifier: `SELECT playerId, password FROM players WHERE email = ? OR mobile = ?`,
  updatePassword: `UPDATE players SET password = ? WHERE playerId = ?`
};