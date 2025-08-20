DELIMITER $$

CREATE PROCEDURE DeleteCategory(
    IN p_category_id INT,
    IN p_is_admin BOOLEAN,
    IN p_player_id INT,
    IN p_auction_id INT
)
BEGIN
    DECLARE v_auction_owner_id INT DEFAULT NULL;
    DECLARE v_auction_is_active BOOLEAN DEFAULT TRUE;
    DECLARE v_category_name VARCHAR(255) DEFAULT NULL;
    DECLARE v_auction_live BOOLEAN DEFAULT FALSE;
    DECLARE v_rows_affected INT DEFAULT 1;
    DECLARE v_access_denied BOOLEAN DEFAULT FALSE;
    DECLARE v_auction_live_flag BOOLEAN DEFAULT FALSE;
    DECLARE v_category_not_found BOOLEAN DEFAULT FALSE;
    DECLARE v_success BOOLEAN DEFAULT TRUE;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT JSON_OBJECT('status', FALSE, 'isError', TRUE) AS result;
    END;
    
    -- Get auction owner and status using clustered PK lookup
    SELECT playerId, isLive, isActive
    INTO v_auction_owner_id, v_auction_live, v_auction_is_active
    FROM auctions 
    WHERE auctionId = p_auction_id;

    IF ROW_COUNT() = 0 THEN
        SET v_category_not_found = TRUE;
        SET v_success = FALSE;
    ELSEIF NOT v_auction_is_active THEN
        SET v_access_denied = TRUE;
        SET v_success = FALSE;
    END IF;

    SELECT name
    INTO v_category_name
    FROM auction_category
    WHERE categoryId = p_category_id AND auctionId = p_auction_id;

    IF ROW_COUNT() = 0 THEN
        SET v_category_not_found = TRUE;
        SET v_success = FALSE;
    END IF;
    
    
    -- Authorization check
    IF NOT p_is_admin AND v_auction_owner_id != p_player_id THEN
        SET v_access_denied = TRUE;
        SET v_success = FALSE;
    -- Live status check
    ELSEIF v_auction_live THEN
        SET v_auction_live_flag = TRUE;
        SET v_success = FALSE;
    END IF;
    
    -- Proceed only if preliminary checks pass
    IF v_success THEN
        START TRANSACTION;
        -- Batch process category player references
        UPDATE auction_category_player
        SET categoryId = NULL
        WHERE categoryId = p_category_id AND auctionId = p_auction_id;

        -- Delete the category
        DELETE FROM auction_category
        WHERE categoryId = p_category_id AND auctionId = p_auction_id;
        
        COMMIT;
    END IF;
    
    -- Return result based on execution context
    IF v_success THEN
        SELECT JSON_OBJECT('status', TRUE, 'playerId', v_auction_owner_id, 'name', v_category_name) AS result;
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