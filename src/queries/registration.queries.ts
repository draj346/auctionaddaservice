export const RegistrationQueries = {
  findFullMatch: `SELECT playerId, isSubmitted FROM players WHERE mobile = ? AND email = ? AND name = ?`,
  findFullMatchWithNull: `SELECT playerId, isSubmitted FROM players WHERE mobile = ? AND email is NULL AND name = ?`,
  findPlayerByMobile: `SELECT playerId, email, name, isSubmitted FROM players WHERE mobile = ?`,
  findPlayerByEmail: `SELECT playerId, mobile, name, isSubmitted FROM players WHERE email = ?`,
  insertPlayer: `INSERT INTO players (name, mobile, email, state, district) VALUES (?, ?, ?, ?, ?)`,
  findNotRegisteredUserById: `SELECT count(*) as count from players WHERE playerId = ? AND isSubmitted = 0`,
  addPlayerInformation: `INSERT INTO player_informations (playerId, jerseyNumber, tShirtSize, lowerSize, hasCricheroesProfile,
                    isPaidPlayer, pricePerMatch, willJoinAnyOwner, playerRole, battingStyle, bowlingStyle, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  setPlayerSubmitted: ` UPDATE players SET isSubmitted = ? WHERE playerId = ?`,
  deletePlayerInformation: `DELETE FROM player_informations where playerId = ?`,
  updateImage: `INSERT INTO player_images (playerId, imageId) 
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE 
                  imageId = ?;`,
  createPlayer: `INSERT INTO players (name, mobile, email, state, district, isSubmitted) VALUES (?, ?, ?, ?, ?, ?)`,
  updatePlayerInformation: `INSERT INTO player_informations (playerId, jerseyNumber, tShirtSize, lowerSize, hasCricheroesProfile,
                    isPaidPlayer, pricePerMatch, willJoinAnyOwner, playerRole, battingStyle, bowlingStyle, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)  
                    ON DUPLICATE KEY UPDATE 
                      jerseyNumber = VALUES(jerseyNumber),
                      tShirtSize = VALUES(tShirtSize),
                      lowerSize = VALUES(lowerSize),
                      hasCricheroesProfile = VALUES(hasCricheroesProfile),
                      isPaidPlayer = VALUES(isPaidPlayer),
                      pricePerMatch = VALUES(pricePerMatch),
                      playerRole = VALUES(playerRole),
                      battingStyle = VALUES(battingStyle),
                      bowlingStyle = VALUES(bowlingStyle),
                      description = VALUES(description),
                      willJoinAnyOwner = VALUES(willJoinAnyOwner)`,
  updatePlayerAddress: `UPDATE players SET isSubmitted = 1, state=?, district=?  WHERE playerId = ?`,
  deletePlayer: `UPDATE players SET isActive = 0 WHERE playerId = ?`,
};

export const MultiUserRegistrationQueries = {
  deactivatePlayers: (ids: string) => {
    return `UPDATE players SET isActive = 0 WHERE playerId IN (${ids})`;
  },
  activatePlayers: (ids: string) => {
    return `UPDATE players SET isActive = 1 WHERE playerId IN (${ids})`;
  },
  updateToNonPlayers: (ids: string) => {
    return `UPDATE players SET isNonPlayer = 1 WHERE playerId IN (${ids})`;
  },
  updateToPlayers: (ids: string) => {
    return `UPDATE players SET isNonPlayer = 0 WHERE playerId IN (${ids})`;
  },
}