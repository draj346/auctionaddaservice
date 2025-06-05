export const PlayerQueries = {
  getPlayers: `SELECT playerId, name, email, mobile, isPaidPlayer  ? FROM players where isActive = 1 AND isSubmitted = 1 AND isApproved = ?`,
  getPlayersByAdmin: `pricePerMatch, isApproved, role`,
  getInactivePlayers: `SELECT playerId, name, email, mobile, isPaidPlayer pricePerMatch, isApproved FROM players where isActive != 1?`
};
