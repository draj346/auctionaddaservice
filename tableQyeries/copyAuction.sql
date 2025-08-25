DELIMITER $$

CREATE PROCEDURE CopyAuction(
    IN p_auctionId INT,
    IN p_playerId INT,
    IN p_isAdmin BOOLEAN,
    IN p_teamlimit INT
)
proc:BEGIN
    DECLARE v_ownerPlayerId INT DEFAULT NULL;
    DECLARE v_name VARCHAR(255) DEFAULT NULL;
    DECLARE v_state VARCHAR(30) DEFAULT NULL;
    DECLARE v_newAuctionId INT;
    DECLARE v_orig_imageId INT DEFAULT NULL;
    DECLARE v_orig_qrCodeId INT DEFAULT NULL;
    DECLARE v_new_imageId INT DEFAULT NULL;
    DECLARE v_new_qrCodeId INT DEFAULT NULL;
    DECLARE v_imagePath VARCHAR(255) DEFAULT NULL;
    DECLARE v_qrPath VARCHAR(255) DEFAULT NULL;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT JSON_OBJECT('status', FALSE, 'isError', TRUE) AS result;
    END;

    SELECT playerId, name, state, imageId, qrCodeId 
    INTO v_ownerPlayerId, v_name, v_state, v_orig_imageId, v_orig_qrCodeId
    FROM auctions 
    WHERE auctionId = p_auctionId;

    IF NOT p_isAdmin THEN
        IF (v_ownerPlayerId IS NULL OR v_ownerPlayerId != p_playerId) THEN
            SELECT JSON_OBJECT('isAccessDenied', TRUE, 'status', FALSE) AS result;
            LEAVE proc; 
        END IF;
    END IF;

    START TRANSACTION;

    IF v_orig_imageId IS NOT NULL THEN
        INSERT INTO files (name, path, url)
        SELECT name, path, url
        FROM files
        WHERE fileId = v_orig_imageId;
        SET v_new_imageId = LAST_INSERT_ID();
        SELECT path INTO v_imagePath FROM files WHERE fileId = v_orig_imageId;
    END IF;

    IF v_orig_qrCodeId IS NOT NULL THEN
        INSERT INTO files (name, path, url)
        SELECT name, path, url
        FROM files
        WHERE fileId = v_orig_qrCodeId;
        SET v_new_qrCodeId = LAST_INSERT_ID();
        SELECT path INTO v_qrPath FROM files WHERE fileId = v_orig_qrCodeId;
    END IF;

    INSERT INTO auctions (
        imageId, name, state, district, 
        maxPlayerPerTeam, minPlayerPerTeam, season, 
        playerId, pointPerTeam, 
        baseBid, baseIncreaseBy, customAttributes, defCategoryDisplayOrderId,
        isPaymentInCompanyAccount, qrCodeId, auctionRule, players_selection_rule
    )
    SELECT 
        v_new_imageId, 
        name, 
        state, 
        district, 
        maxPlayerPerTeam, 
        minPlayerPerTeam,
        IFNULL(season + 1, season),
        playerId, 
        pointPerTeam, 
        baseBid, 
        baseIncreaseBy, 
        customAttributes,
        defCategoryDisplayOrderId, 
        isPaymentInCompanyAccount, 
        v_new_qrCodeId,
        auctionRule,
        players_selection_rule
    FROM auctions
    WHERE auctionId = p_auctionId
    LIMIT 1;

    SET v_newAuctionId = LAST_INSERT_ID();

    INSERT INTO auction_category (
        name, auctionId, maxPlayer, minPlayer, baseBid,
        reserveBid, highestBid, categoryHighestBid, increments
    )
    SELECT 
        name, 
        v_newAuctionId,    
        maxPlayer, 
        minPlayer, 
        baseBid,
        reserveBid, 
        highestBid,
        categoryHighestBid,
        increments
    FROM auction_category
    WHERE auctionId = p_auctionId
    ORDER BY categoryId;

    INSERT INTO teams (
        name, shortName, image, shortcutKey, auctionId
    )
    SELECT 
        name, 
        shortName, 
        image, 
        shortcutKey, 
        v_newAuctionId
    FROM teams
    WHERE auctionId = p_auctionId 
      AND isActive = TRUE
    ORDER BY teamId
    LIMIT p_teamlimit; 

    COMMIT;

    SELECT JSON_OBJECT(
        'status', TRUE,
        'auctionId', v_newAuctionId,
        'playerId', v_ownerPlayerId,
        'name', v_name,
        'state', v_state,
        'imageId', v_new_imageId,
        'qrCodeId', v_new_qrCodeId,
        'imagePath', v_imagePath,
        'qrCodePath', v_qrPath
    ) AS result;

end proc$$

DELIMITER ;