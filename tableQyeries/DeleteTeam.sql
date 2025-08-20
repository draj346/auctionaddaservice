DELIMITER $$

CREATE PROCEDURE DeleteTeam(
    IN p_teamId INT,
    IN p_is_admin BOOLEAN,
    IN p_player_id INT,
    IN p_auction_id INT
)
BEGIN
    DECLARE v_auction_owner_id INT DEFAULT NULL;
    DECLARE v_auction_is_active BOOLEAN DEFAULT TRUE;
    DECLARE v_team_name VARCHAR(255) DEFAULT NULL;
    DECLARE v_auction_live BOOLEAN DEFAULT FALSE;
    DECLARE v_rows_affected INT DEFAULT 1;
    DECLARE v_in_transaction BOOLEAN DEFAULT FALSE;
    DECLARE v_access_denied BOOLEAN DEFAULT FALSE;
    DECLARE v_auction_live_flag BOOLEAN DEFAULT FALSE;
    DECLARE v_team_not_found BOOLEAN DEFAULT FALSE;
    DECLARE v_success BOOLEAN DEFAULT TRUE;
    DECLARE v_imageId INT DEFAULT NULL;
    DECLARE v_imagePath VARCHAR(255) DEFAULT NULL;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        IF v_in_transaction THEN
            ROLLBACK;
            SET v_in_transaction = FALSE;
        END IF;
        SET v_success = FALSE;
    END;

    SELECT playerId, isLive, isActive
    INTO v_auction_owner_id, v_auction_live, v_auction_is_active
    FROM auctions 
    WHERE auctionId = p_auction_id;

    IF ROW_COUNT() = 0 THEN
        SET v_team_not_found = TRUE;
        SET v_success = FALSE;
    ELSEIF NOT v_auction_is_active THEN
        SET v_access_denied = TRUE;
        SET v_success = FALSE;
    END IF;

    SELECT name, image
    INTO v_team_name, v_imageId
    FROM teams
    WHERE teamId = p_teamId AND auctionId = p_auction_id;

    IF ROW_COUNT() = 0 THEN
        SET v_team_not_found = TRUE;
        SET v_success = FALSE;
    END IF;

    IF NOT p_is_admin AND v_auction_owner_id != p_player_id THEN
        SET v_access_denied = TRUE;
        SET v_success = FALSE;
    ELSEIF v_auction_live THEN
        SET v_auction_live_flag = TRUE;
        SET v_success = FALSE;
    END IF;

    IF v_success THEN
        START TRANSACTION;
        SET v_in_transaction = TRUE;
            
        DELETE FROM team_owner WHERE teamId = p_teamId;
        DELETE FROM team_wishlist WHERE teamId = p_teamId;
        DELETE FROM teams WHERE teamId = p_teamId;
            
        COMMIT;
        SET v_in_transaction = FALSE;
    END IF;

    IF v_success AND v_imageId IS NOT NULL THEN
        SELECT path INTO v_imagePath FROM files WHERE fileId = v_imageId;
        DELETE FROM files WHERE fileId = v_imageId;
    END IF;

    IF v_success THEN
        SELECT JSON_OBJECT('status', TRUE, 'playerId', v_auction_owner_id, 'name', v_team_name, 'imagePath', v_imagePath) AS result;
    ELSE
        IF v_access_denied THEN
            SELECT JSON_OBJECT('status', FALSE, 'isAccessDenied', TRUE) AS result;
        ELSEIF v_auction_live_flag THEN
            SELECT JSON_OBJECT('status', FALSE, 'isLive', TRUE) AS result;
        ELSEIF v_category_not_found THEN
            SELECT JSON_OBJECT('status', FALSE, 'isNotFound', TRUE) AS result;
        ELSE
            SELECT JSON_OBJECT('status', FALSE, 'isError', TRUE) AS result;
        END IF;
    END IF;
END$$

DELIMITER ;