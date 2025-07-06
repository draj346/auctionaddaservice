export const NotificationQueries = {
  createNotification: `INSERT INTO notifications 
                        (playerId, message, type, submittedBy, role)
                        VALUES (?, ?, ?, ?, ?)`,
  getNotifications: `SELECT n.message, n.type, n.createdAt, n.role, isRead
                      FROM notifications n
                      WHERE n.playerId = ?
                      AND (
                          isRead = false OR 
                          (isRead = true AND updatedAt >= NOW() - INTERVAL 48 HOUR)
                      )
                      ORDER BY n.createdAt DESC`,
  getNewNotificationsCount: `SELECT count(*) as total
                              FROM notifications n
                              WHERE n.playerId = ?
                              and n.isRead is False`,
  updateIsRead: `UPDATE notifications SET isRead = ? WHERE playerId=?`,
  createPendingUpdate: `INSERT INTO pending_updates 
                        (playerId, submittedBy, updatedData, status, message, role, type, previousData)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  getPendingUpdate: `SELECT id, submittedBy, updatedData, previousData, message, type, role, createdAt from pending_updates where status='pending' and playerId =? ORDER BY createdAt DESC`,
  getPendingUpdateCount: `SELECT count(*) as total from pending_updates where status='pending' and playerId =?`,
  updatePendingStatus: `UPDATE pending_updates 
                        SET status = ?
                        WHERE id = ?`,
  pendingUpdate: `SELECT updatedData FROM pending_updates WHERE id = ?`,
};

export const NotificationQueriesFn = {
 batchCreateNotification: (values: string) => `INSERT INTO notifications 
                        (playerId, message, type, submittedBy, role)
                        VALUES ${values}`,
}