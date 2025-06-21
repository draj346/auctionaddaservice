export const RegistrationQueries = {
  findPlayerByMobile: `SELECT playerId, email, name, isSubmitted FROM players WHERE mobile = ?`,
  findPlayerByEmail: `SELECT playerId, mobile, name, isSubmitted FROM players WHERE email = ?`,
  findFullMatch: `SELECT playerId, isSubmitted FROM players WHERE mobile = ? AND email = ? AND name = ?`,
  insertPlayer: `INSERT INTO players (name, mobile, email) VALUES (?, ?, ?)`,
  updatePlayer: `
    UPDATE players SET 
      name = ?,
      jerseyNumber = ?,
      tShirtSize = ?,
      lowerSize = ?,
      hasCricheroesProfile = ?,
      isPaidPlayer = ?,
      pricePerMatch = ?,
      willJoinAnyOwner = ?,
      image = ?,
      isSubmitted = ?
    WHERE playerId = ?`,
    createPlayer: `INSERT INTO players (name, mobile, email, jerseyNumber, tShirtSize, lowerSize, hasCricheroesProfile,
                    isPaidPlayer, pricePerMatch, willJoinAnyOwner, image, isSubmitted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    deletePlayer: `UPDATE players SET isActive = 0 WHERE playerId = ?`,
    deactivatePlayers(ids: string) {
      return `UPDATE players SET isActive = 0 WHERE playerId IN (${ids})`
    },
    updateToNonPlayers(ids: string) {
      return `UPDATE players SET isNonPlayer = 1 WHERE playerId IN (${ids})`
    },
    updateToPlayers(ids: string) {
      return `UPDATE players SET isNonPlayer = 0 WHERE playerId IN (${ids})`
    },
};
