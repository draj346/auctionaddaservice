"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionQueries = void 0;
exports.AuctionQueries = {
    upsertAuction: `INSERT INTO auctions (
                      auctionId,
                      imageId, 
                      name, 
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
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                  ON DUPLICATE KEY UPDATE
                      imageId = VALUES(imageId),
                      name = VALUES(name),
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
    getAuctions: `SELECT auctionId, imageId, name, state, district, paymentStatus, startDate, startTime, maxPlayerPerTeam,
                code, isLive, pointPerTeam, baseBid, baseIncreaseBy from auctions where isActive is True and playerId = ?`,
    getAuctionDetails: `SELECT imageId, name, state, district, paymentStatus, DATE_FORMAT(startDate, '%d-%m-%Y') AS startDate, startTime, maxPlayerPerTeam, minPlayerPerTeam,
                code, isLive, pointPerTeam, baseBid, baseIncreaseBy, isPaymentInCompanyAccount, qrCodeId, auctionRule as rule  from auctions where isActive is True and auctionId = ?`,
    getAuctionSearchByAdmin: `SELECT auctionId, imageId, name, state, district, paymentStatus, startDate, startTime, maxPlayerPerTeam,
                code, isLive, pointPerTeam, baseBid, baseIncreaseBy from auctions where 
                code LIKE CONCAT('%', ?, '%') OR name LIKE CONCAT('%', ?, '%')`,
    deleteAuctionById: `CALL AuctionDeletion(?, ?, ?)`,
    updateAuctionCode: `UPDATE auctions SET code = ? WHERE auctionId = ?`,
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
    getTeamsByAuctionId: `SELECT teamId, name, shortName, image, shortcutKey FROM teams WHERE auctionId = ?`,
    deleteTeamsById: `CALL DeleteTeam(?)`,
    assignOwnerToTeam: `INSERT INTO team_owner (auctionId, teamId, ownerId, tag)
                      VALUES (?, ?, ?, ?);`,
    removeOwnerFromTeam: `DELETE FROM team_owner WHERE teamId = ? and ownerId = ?;`,
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
                    name = VALUES(name),
                    maxPlayer = VALUES(maxPlayer),
                    minPlayer = VALUES(minPlayer),
                    baseBid = VALUES(baseBid),
                    reserveBid = VALUES(reserveBid),
                    highestBid = VALUES(highestBid),
                    categoryHighestBid = VALUES(categoryHighestBid),
                    increments = VALUES(increments);`,
    getCategoriesByAuctionId: `SELECT categoryId, name, maxPlayer, minPlayer, baseBid, reserveBid, highestBid, 
                             categoryHighestBid, increments WHERE auctionId = ?`,
    getPlayerByCategoryId: `Select playerId FROM auction_category_player WHERE categoryId = ? AND auctionId = ?`,
    deleteCategoryById: `CALL DeleteCategory(?)`,
    updatePlayerToAuction: `CALL ManageAuctionPlayers(?, ?, ?, ?)`,
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
};
