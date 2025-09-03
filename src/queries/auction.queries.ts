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
  isPaymentDoneForAuction: `SELECT count(*) as count from auctions where auctionId = ? AND paymentStatus is True AND isActive is True`,
  isOrganiser: `select count(*) as count from auctions where paymentStatus is true and playerId = ? and isActive is true and (isLive is false or (isLive is true and startDate <=CURDATE()))`,
  getAuctionPlayerId: `SELECT playerId, name, code from auctions where auctionId = ? AND isActive is True AND isLive is False`,
  getLiveAuctionPlayerId: `SELECT playerId, name, code from auctions where auctionId = ? AND isActive is True AND isCompleted is False`,
  isAuctionAccess: `SELECT playerId, name, code from auctions where auctionId = ? AND isActive is True;`,
  isValidAuction: `SELECT count(*) as count from auctions where auctionId = ? AND playerId =? AND isActive is True`,
  isValidAuctionPlayerIdForEdit: `SELECT playerId from auctions where auctionId = ? AND isActive is True and isLive is False`,
  getAuctions: `SELECT auctionId, imageId, name, season, state, district, paymentStatus, startDate, startTime, maxPlayerPerTeam,
                code, isLive, isCompleted, pointPerTeam, baseBid, baseIncreaseBy from auctions where isActive is True and playerId = ? order by startDate desc;`,
  getUpcomingAuctions: `SELECT auctionId, imageId, name, season, state, district, paymentStatus, startDate, startTime, maxPlayerPerTeam,
                code, isLive, isCompleted, pointPerTeam, baseBid, baseIncreaseBy from auctions where isActive is True and paymentStatus is true and isLive is false order by startDate desc;`,
  getLiveAuctions: `SELECT auctionId, imageId, name, season, state, district, paymentStatus, startDate, startTime, maxPlayerPerTeam,
                code, isLive, isCompleted, pointPerTeam, baseBid, baseIncreaseBy from auctions where isActive is True and paymentStatus is true and isLive is true and isCompleted is false order by startTime desc;`,
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
                code, isLive, IF(
                          isCompleted OR 
                          (isLive AND startDate <= DATE_SUB(CURRENT_DATE, INTERVAL 2 DAY)),
                          true, 
                          false
                      ) AS isCompleted, pointPerTeam, baseBid, baseIncreaseBy, isPaymentInCompanyAccount, qrCodeId, auctionRule as rule  from auctions where isActive is True and auctionId = ?`,
  getAuctionSearchByAdmin: `SELECT auctionId, imageId, name, season, state, district, paymentStatus, startDate, startTime, maxPlayerPerTeam,
                code, isLive, IF(
                          isCompleted OR 
                          (isLive AND startDate <= DATE_SUB(CURRENT_DATE, INTERVAL 2 DAY)),
                          true, 
                          false
                      ) AS isCompleted, pointPerTeam, baseBid, baseIncreaseBy from auctions where 
                code LIKE CONCAT('%', ?, '%') OR name LIKE CONCAT('%', ?, '%')`,
  deleteAuctionById: `CALL AuctionDeletion(?, ?, ?)`,
  copyAuctionById: `CALL CopyAuction(?, ?, ?, ?)`,
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
  getTeamsByAuctionId: `SELECT 
                          t.teamId, 
                          t.name, 
                          t.shortName, 
                          t.image as imageId, 
                          t.shortcutKey, 
                          a.maxPlayerPerTeam, 
                          a.minPlayerPerTeam,
                          COUNT(atp.playerId) as playerCount
                        FROM teams t 
                        LEFT JOIN auctions a ON a.auctionId = t.auctionId
                        LEFT JOIN auction_team_player atp ON t.teamId = atp.teamId AND atp.auctionId = t.auctionId
                        WHERE t.auctionId = ?
                        GROUP BY t.teamId;`,
  getPlayerCountForTeam: `select count(*) as count from auction_team_player atp where auctionId =?`,
  getTeamsById: `SELECT 
                  t.teamId, 
                  t.name, 
                  t.shortName, 
                  t.image as imageId, 
                  t.shortcutKey, 
                  a.maxPlayerPerTeam, 
                  a.minPlayerPerTeam,
                  COUNT(atp.playerId) as playerCount
                FROM teams t 
                LEFT JOIN auctions a ON a.auctionId = t.auctionId
                LEFT JOIN auction_team_player atp ON t.teamId = atp.teamId AND atp.auctionId = t.auctionId
                WHERE t.auctionId = ? 
                  AND t.teamId = ?
                GROUP BY t.teamId;`,
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
  updatePlayerToAuction: `CALL ManageAuctionPlayers(?, ?, ?, ?, ?, ?, ?)`,
  updatePlayerToTeam: `CALL ManageTeamPlayers(?, ?, ?, ?, ?, ?, ?)`,
  resetAuctionPlayers: `CALL ResetAuctionPlayers(?, ?, ?)`,
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
  getOnwers: `select to2.tag, to2.name from team_owner to2 where auctionId = ? `,
  getCountAuctionPlayersPending: `select count(*) as total from auction_category_player where auctionId = ?`,
  getTeamPlayerCountById: `select count(*) as total from auction_team_player where auctionId = ? and teamId = ?`,
  getAuctionDetailByCode: `SELECT auctionId, imageId, name, season, state, district, paymentStatus, DATE_FORMAT(startDate, '%d-%m-%Y') AS startDate, startTime, maxPlayerPerTeam, minPlayerPerTeam,
                code, isLive, isCompleted, pointPerTeam, baseBid, paymentStatus, baseIncreaseBy, qrCodeId, auctionRule as rule, isPaymentInCompanyAccount from auctions where isActive is True and code = ?;`,
  getMyAuctions: `select 
                    a.name, a.code, a.auctionId,
                    CONCAT(a.district, ' (', a.state, ')') as location,
                    DATE_FORMAT(a.startDate, '%d-%m-%Y') as startDate
                  from auctions a 
                  LEFT JOIN auction_category_player acp ON a.auctionId = acp.auctionId
                  WHERE acp.playerId =?`,
  getAuctionStatusForJoin: `SELECT isApproved from auction_category_player acp WHERE acp.playerId = ? AND acp.auctionId = ?`,
  getTeamByAuctionId: `select teamId, name, shortName, shortcutKey, image as imageId from teams where auctionId = ?`,
  getTeamByTeamId: `select teamId, name, shortName, shortcutKey, image as imageId from teams where auctionId = ? and teamId = ?`,
  getOwnerByAuctionId: `SELECT t.tag as type, p.name, t.teamId, p.playerId from team_owner t join players p on p.playerId = t.ownerId where t.auctionId = ?`,
  getOwnerByTeamId: `SELECT t.tag as type, p.name, p.email, p.mobile, t.teamId, p.playerId from team_owner t join players p on p.playerId = t.ownerId where t.teamId = ?`,
  getFirstOwnerByAuctionId: `SELECT 
                              to1.teamId,
                              p.name
                            FROM team_owner to1
                            INNER JOIN players p ON to1.ownerId = p.playerId
                            WHERE to1.auctionId = ? 
                              AND to1.tag = 'OWNER'
                              AND to1.id = (
                                SELECT MIN(to2.id)
                                FROM team_owner to2
                                WHERE to2.teamId = to1.teamId
                                  AND to2.auctionId = to1.auctionId
                                  AND to2.tag = 'OWNER'
                              )`,
  getPlayersByAuctionId: `
                        SELECT 
                          ROW_NUMBER() OVER (ORDER BY p.playerId) as number,
                          p.name,
                          pi.playerRole,
                          pi.bowlingStyle,
                          pi.battingStyle,
                          f.url as image,
                          LOWER(acp.status) as status,
                          pi.description,
                          ac.name as categoryName,
                          ac.categoryHighestBid as maxBidAmount,
                          p.playerId,
                          acp.star,
                          acp.baseBid,
                          t.name as team,
                          atp.price as points,
                          atp.status as soldStatus,
                          t.teamId
                        FROM auction_category_player acp
                        INNER JOIN players p ON acp.playerId = p.playerId
                        LEFT JOIN player_informations pi ON p.playerId = pi.playerId
                        LEFT JOIN player_images pimg ON p.playerId = pimg.playerId
                        LEFT JOIN files f ON pimg.imageId = f.fileId
                        LEFT JOIN auction_category ac ON acp.categoryId = ac.categoryId AND acp.auctionId = ac.auctionId
                        LEFT JOIN auction_team_player atp ON acp.playerId = atp.playerId AND acp.auctionId = atp.auctionId AND atp.isActive = TRUE
                        LEFT JOIN teams t ON atp.teamId = t.teamId AND t.auctionId = acp.auctionId
                        WHERE acp.auctionId = ?
                        AND acp.isApproved = TRUE
                        ORDER BY p.playerId;
  `,
  getPlayersByTeamId: `
                        SELECT 
                          ROW_NUMBER() OVER (ORDER BY p.playerId) as number,
                          p.name,
                          p.email,
                          p.mobile,
                          LOWER(acp.status) as status,
                          p.playerId,
                          acp.baseBid,
                          atp.price as points,
                          atp.status as soldStatus
                        FROM auction_category_player acp
                        INNER JOIN players p ON acp.playerId = p.playerId
                        LEFT JOIN auction_team_player atp ON acp.playerId = atp.playerId AND acp.auctionId = atp.auctionId AND atp.isActive = TRUE
                        LEFT JOIN teams t ON atp.teamId = t.teamId AND t.auctionId = acp.auctionId
                        WHERE acp.auctionId = ?
                        AND t.teamId = ?
                        AND acp.isApproved = TRUE
                        ORDER BY p.playerId;
  `,
  getAuctionInfo: `SELECT 
                      season, 
                      paymentStatus, 
                      startDate, 
                      maxPlayerPerTeam, 
                      isLive, 
                      IF(
                          isCompleted OR 
                          (isLive AND startDate <= DATE_SUB(CURRENT_DATE, INTERVAL 2 DAY)),
                          true, 
                          false
                      ) AS isCompleted,
                      pointPerTeam, 
                      baseBid, 
                      baseIncreaseBy, 
                      LOWER(players_selection_rule) AS playerOrder,
                      imageId,
                      name
                  FROM auctions 
                  WHERE auctionId = ?`,
  updatePlayerStatus: `update auction_category_player set status = ? where auctionId = ? and playerId = ?`,
  reauctionUnsoldPlayer: `UPDATE auction_category_player acp
        SET acp.status = 'AVAILABLE'
        WHERE acp.auctionId = ? 
        AND acp.status = 'UNSOLD'`,
  updatePlayerOrder: `UPDATE auctions set players_selection_rule = ? WHERE auctionId = ?`,
  updateAuctionMode: `UPDATE auctions set isLive = True WHERE auctionId = ? and paymentStatus is True and isActive is True;`,
  checkOwnerAccess: `SELECT EXISTS (
                  SELECT 1
                  FROM team_owner to1
                  INNER JOIN teams t ON to1.teamId = t.teamId
                  WHERE 
                      to1.auctionId = 1020
                      AND to1.ownerId = 12048
                      AND t.isActive = true
              ) AS isOwner;`
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
  },
};
