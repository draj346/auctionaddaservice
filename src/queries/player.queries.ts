export const PlayerQueries = {
  findPlayerByMobile: `SELECT playerId, isSubmitted FROM players WHERE mobile = ?`,
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
      image = ?,
      isSubmitted = ?,
      isNonPlayer = ?,
      isOwner = ?,
      isAdmin = ?
    WHERE playerId = ?`,
  getPlayers: `SELECT playerId, name, email FROM players`,
};