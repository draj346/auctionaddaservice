export const AuctionQueries = {
  upsertAuction: `INSERT INTO auctions (
                      auctionId,
                      imageId, 
                      name,
                      season,
                      state, 
                      district, 
                      startDate, 
                      startTime, 
                      maxPlayerPerTeam, 
                      minPlayerPerTeam,
                      playerId,
                      pointPerTeam,
                      baseBid,
                      baseIncreaseBy,
                      isPaymentInCompanyAccount,
                      qrCodeId,
                      auctionRule
                  ) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                  ON DUPLICATE KEY UPDATE
                      imageId = VALUES(imageId),
                      name = VALUES(name),
                      season = VALUES(season),
                      state = VALUES(state),
                      district = VALUES(district),
                      startDate = VALUES(startDate),
                      startTime = VALUES(startTime),
                      maxPlayerPerTeam = VALUES(maxPlayerPerTeam),
                      minPlayerPerTeam = VALUES(minPlayerPerTeam),
                      pointPerTeam = VALUES(pointPerTeam),
                      baseBid = VALUES(baseBid),
                      isPaymentInCompanyAccount = VALUES(isPaymentInCompanyAccount),
                      qrCodeId = VALUES(qrCodeId),
                      auctionRule = VALUES(auctionRule),
                      baseIncreaseBy = VALUES(baseIncreaseBy);`,
  checkAuctionPending: `SELECT count(*) as count from auctions where playerId = ? AND paymentStatus is False AND isActive is True`,
  isOrganiser: `select count(*) as count from auctions where paymentStatus is true and playerId = ? and isActive is true and (isLive is false or (isLive is true and startDate <=CURDATE()))`,
  getAuctionPlayerId: `SELECT playerId, name, code from auctions where auctionId = ? AND isActive is True AND isLive is False`,
  isValidAuction: `SELECT count(*) as count from auctions where auctionId = ? AND playerId =? AND isActive is True`,
  isValidAuctionPlayerIdForEdit: `SELECT playerId from auctions where auctionId = ? AND isActive is True and isLive is False`,
  getAuctions: `SELECT auctionId, imageId, name, season, state, district, paymentStatus, startDate, startTime, maxPlayerPerTeam,
                code, isLive, isCompleted, pointPerTeam, baseBid, baseIncreaseBy from auctions where isActive is True and playerId = ?`,
  getAuctionForCopy: `SELECT auctionId  as value, CONCAT(
        name, 
        ' (', code, ')',
        CASE 
            WHEN season IS NOT NULL THEN CONCAT(' - Season ', season)
            ELSE ''
        END
    ) as label from auctions where playerId = ? AND paymentStatus is True AND isActive is True ORDER BY startdate DESC LIMIT 10`,
  getAuctionForCopyForAdmin: `SELECT auctionId as value, CONCAT(
        name, 
        ' (', code, ')',
        CASE 
            WHEN season IS NOT NULL THEN CONCAT(' - Season ', season)
            ELSE ''
        END
    ) as label from auctions where isActive is True ORDER BY startdate DESC LIMIT 100`,
  getAuctionDetails: `SELECT imageId, name, season, state, district, paymentStatus, DATE_FORMAT(startDate, '%d-%m-%Y') AS startDate, startTime, maxPlayerPerTeam, minPlayerPerTeam,
                code, isLive, isCompleted, pointPerTeam, baseBid, baseIncreaseBy, isPaymentInCompanyAccount, qrCodeId, auctionRule as rule  from auctions where isActive is True and auctionId = ?`,
  getAuctionSearchByAdmin: `SELECT auctionId, imageId, name, season, state, district, paymentStatus, startDate, startTime, maxPlayerPerTeam,
                code, isLive, isCompleted, pointPerTeam, baseBid, baseIncreaseBy from auctions where 
                code LIKE CONCAT('%', ?, '%') OR name LIKE CONCAT('%', ?, '%')`,
  deleteAuctionById: `CALL AuctionDeletion(?, ?, ?)`,
  copyAuctionById: `CALL CopyAuction(?, ?, ?)`,
  updateAuctionCode: `UPDATE auctions SET code = ? WHERE auctionId = ?`,
  updateAuctionCompletionStatus: `UPDATE auctions SET isCompleted = TRUE WHERE auctionId = ?`,
  approveAuction: `UPDATE auctions SET paymentStatus = TRUE WHERE auctionId = ?`,
  getAuctionName: `SELECT name, state, code, playerId from auctions where auctionId = ?`,
  updateCatergoryRule: `UPDATE auctions
                        SET defCategoryDisplayOrderId = ?,
                            players_selection_rule = ?,
                            modifiedAt = CURRENT_TIMESTAMP
                        WHERE auctionId = ?;`,
  upsetTransaction: `INSERT INTO transactions (auctionId, amount, transactionId, status)
                      VALUES (?, ?, ?, ?)
                      ON DUPLICATE KEY UPDATE 
                          status = VALUES(status);`,   
  upsetTeam: `INSERT INTO teams (
                teamId,
                name,
                shortName,
                image,
                shortcutKey,
                auctionId
              )
              VALUES (?, ?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                shortName = VALUES(shortName),
                image = VALUES(image),
                shortcutKey = VALUES(shortcutKey);`,
  getTeamsByAuctionId: `SELECT teamId, name, shortName, image as imageId, shortcutKey FROM teams WHERE auctionId = ?`,
  getTeamsById: `SELECT teamId, name, shortName, image as imageId, shortcutKey FROM teams WHERE auctionId = ? AND teamId = ?`,
  deleteTeamsById: `CALL DeleteTeam(?, ?, ?, ?)`,   
  getTeamCount: `select count(*) as count from teams where auctionId = ?`,             
  assignOwnerToTeam: `INSERT IGNORE INTO team_owner (auctionId, teamId, ownerId, tag)
                      VALUES (?, ?, ?, ?);`,
  removeOwnerFromTeam: `DELETE FROM team_owner WHERE teamId = ? AND ownerId = ? AND auctionId = ?`,
  upsetCategory: `INSERT INTO auction_category (
                    categoryId,
                    auctionId,
                    name,
                    maxPlayer,
                    minPlayer,
                    baseBid,
                    reserveBid,
                    highestBid,
                    categoryHighestBid,
                    increments
                  )
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                  ON DUPLICATE KEY UPDATE
                    auctionId = VALUES(auctionId),
                    name = VALUES(name),
                    maxPlayer = VALUES(maxPlayer),
                    minPlayer = VALUES(minPlayer),
                    baseBid = VALUES(baseBid),
                    reserveBid = VALUES(reserveBid),
                    highestBid = VALUES(highestBid),
                    categoryHighestBid = VALUES(categoryHighestBid),
                    increments = VALUES(increments);`,
  getCategoriesByAuctionId: `SELECT categoryId, name, maxPlayer, minPlayer, baseBid, reserveBid, highestBid, 
                             categoryHighestBid, increments from auction_category WHERE auctionId = ?`,
  getCategoriesById: `SELECT categoryId, name, maxPlayer, minPlayer, baseBid, reserveBid, highestBid, 
                             categoryHighestBid, increments from auction_category WHERE auctionId = ? AND categoryId = ?`,
  getPlayerByCategoryId: `Select playerId FROM auction_category_player WHERE categoryId = ? AND auctionId = ?`,
  deleteCategoryById: `CALL DeleteCategory(?, ?, ?, ?)`,
  updatePlayerToAuction: `CALL ManageAuctionPlayers(?, ?, ?, ?, ?, ?)`,
  upsetWishlist: `INSERT INTO team_wishlist (
                    id,
                    teamId,
                    auctionId,
                    playerId,
                    tag
                  )
                  VALUES (?, ?, ?, ?, ?)
                  ON DUPLICATE KEY UPDATE
                    tag = VALUES(tag);`,
  deleteFromWhislist: `DELETE FROM team_wishlist WHERE teamId = ? and playerId = ?`,
  getTeamOwnerInfo: `SELECT t.tag, p.name, p.playerId from team_owner t join players p on p.playerId = t.ownerId where t.teamId = ?`,
  getCountAuctionPlayersPending: `select count(*) as total from auction_category_player where auctionId = ?`
};

export const MultiUserAuctionQueries = {
  approvePlayerToAuction: (ids: string, auctionId: number) => {
    return `UPDATE auction_category_player SET isApproved = True WHERE playerId IN (${ids}) AND auctionId = ${auctionId}`;
  },
  starPlayerForAuction: (ids: string, auctionId: number) => {
    return `UPDATE auction_category_player SET star = True WHERE playerId IN (${ids}) AND auctionId = ${auctionId}`;
  },
  unStarPlayerForAuction: (ids: string, auctionId: number) => {
    return `UPDATE auction_category_player SET star = False WHERE playerId IN (${ids}) AND auctionId = ${auctionId}`;
  }
}