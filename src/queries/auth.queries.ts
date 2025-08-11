export const AuthQueries = {
  findLoggedInPlayerCountById: `SELECT count(*) as count FROM players WHERE playerId = ? AND isActive = 1 AND isSubmitted = 1`
};

export const GuestAuthQueries = {
  findPlayerCountById: `SELECT count(*) as count FROM players WHERE playerId = ?`,
  findPlayerCountByIdentifier: `SELECT count(*) as count FROM players WHERE (email = ? OR mobile = ?) AND isActive = 1 AND isSubmitted = 1`,
  findPlayerIdByIdentifier: `SELECT playerId, name, mobile, email from players WHERE (email = ? OR mobile = ?) AND isActive = 1 AND isSubmitted = 1`,
  updatePassword: `INSERT INTO player_auth (playerId, passwordHash) VALUES (?, ?) ON DUPLICATE KEY UPDATE passwordHash  = VALUES(passwordHash)`,
  getImageByIdentifier: `SELECT 
                        (SELECT f.url FROM files f WHERE f.fileId = pi.imageId) AS url
                        FROM player_images pi 
                        WHERE pi.playerId = ?;`,
  getPassword: `SELECT passwordHash as password FROM player_auth WHERE playerId = ?`,
}