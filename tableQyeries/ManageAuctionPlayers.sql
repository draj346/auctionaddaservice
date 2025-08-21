DELIMITER $$

CREATE PROCEDURE ManageAuctionPlayers(
    IN p_operation ENUM('ASSIGN_AUCTION', 'ASSIGN_CATEGORY', 'REMOVE_CATEGORY', 'REMOVE_AUCTION', 'ASSIGN_SELF'),
    IN p_auction_id INT,
    IN p_category_id INT,
    IN p_player_ids JSON,
    IN p_base_bid INT,
    IN p_is_approved BOOLEAN,
    IN p_payment_id INT
)
BEGIN
    DECLARE v_auction_owner_id INT DEFAULT NULL;
    DECLARE v_auction_is_active BOOLEAN DEFAULT TRUE;
    DECLARE v_category_name VARCHAR(255) DEFAULT NULL;
    DECLARE v_auction_name VARCHAR(255) DEFAULT NULL;
    DECLARE v_auction_live BOOLEAN DEFAULT FALSE;
    DECLARE v_in_transaction BOOLEAN DEFAULT FALSE;
    DECLARE v_access_denied BOOLEAN DEFAULT FALSE;
    DECLARE v_auction_live_flag BOOLEAN DEFAULT FALSE;
    DECLARE v_not_found BOOLEAN DEFAULT FALSE;
    DECLARE v_success BOOLEAN DEFAULT TRUE;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        IF v_in_transaction THEN
            ROLLBACK;
            SET v_in_transaction = FALSE;
        END IF;
        SET v_success = FALSE;
    END;

    SELECT playerId, isLive, isActive, name
    INTO v_auction_owner_id, v_auction_live, v_auction_is_active, v_auction_name
    FROM auctions 
    WHERE auctionId = p_auction_id;

    IF ROW_COUNT() = 0 THEN
        SET v_not_found = TRUE;
        SET v_success = FALSE;
    ELSEIF NOT v_auction_is_active THEN
        SET v_access_denied = TRUE;
        SET v_success = FALSE;
    ELSEIF v_auction_live THEN
        SET v_auction_live_flag = TRUE;
        SET v_success = FALSE;
    END IF;

    IF v_success AND p_operation IN ('ASSIGN_CATEGORY', 'REMOVE_CATEGORY') THEN
        SELECT name INTO v_category_name
        FROM auction_category
        WHERE categoryId = p_category_id 
          AND auctionId = p_auction_id;

        IF v_category_name IS NULL THEN
            SET v_not_found = TRUE;
            SET v_success = FALSE;
        END IF;
    END IF;

    IF v_success THEN
        START TRANSACTION;
        SET v_in_transaction = TRUE;
        
        CASE p_operation
            WHEN 'ASSIGN_AUCTION' THEN
                INSERT IGNORE INTO auction_category_player (auctionId, playerId, baseBid, isApproved)
                SELECT p_auction_id, player_id, p_base_bid, p_is_approved
                FROM JSON_TABLE(
                    p_player_ids,
                    '$[*]' COLUMNS(player_id INT PATH '$')
                ) AS jt
                ON DUPLICATE KEY UPDATE 
                    baseBid = VALUES(baseBid);
                
                IF ROW_COUNT() = 0 AND JSON_LENGTH(p_player_ids) > 0 THEN
                    SET v_success = FALSE;
                END IF;

            WHEN 'ASSIGN_SELF' THEN
                INSERT IGNORE INTO auction_category_player (auctionId, playerId, paymentId)
                SELECT p_auction_id, player_id, p_payment_id
                FROM JSON_TABLE(
                    p_player_ids,
                    '$[*]' COLUMNS(player_id INT PATH '$')
                ) AS jt
                ON DUPLICATE KEY UPDATE 
                    paymentId = VALUES(paymentId);
                
                IF ROW_COUNT() = 0 AND JSON_LENGTH(p_player_ids) > 0 THEN
                    SET v_success = FALSE;
                END IF;

            WHEN 'ASSIGN_CATEGORY' THEN
                INSERT INTO auction_category_player (auctionId, playerId, categoryId)
                SELECT p_auction_id, player_id, p_category_id
                FROM JSON_TABLE(
                    p_player_ids,
                    '$[*]' COLUMNS(player_id INT PATH '$')
                ) AS jt
                ON DUPLICATE KEY UPDATE 
                    categoryId = VALUES(categoryId);
                    
                IF ROW_COUNT() = 0 AND JSON_LENGTH(p_player_ids) > 0 THEN
                    SET v_success = FALSE;
                END IF;

            WHEN 'REMOVE_CATEGORY' THEN 
                UPDATE auction_category_player FORCE INDEX (idx_auction_player)
                SET categoryId = NULL
                WHERE auctionId = p_auction_id
                AND playerId IN (
                    SELECT player_id
                    FROM JSON_TABLE(
                        p_player_ids,
                        '$[*]' COLUMNS(player_id INT PATH '$')
                    ) AS jt
                );
                
                IF ROW_COUNT() = 0 AND JSON_LENGTH(p_player_ids) > 0 THEN
                    SET v_success = FALSE;
                END IF;

            WHEN 'REMOVE_AUCTION' THEN
                DELETE FROM auction_category_player
                WHERE auctionId = p_auction_id
                AND playerId IN (
                    SELECT player_id
                    FROM JSON_TABLE(
                        p_player_ids,
                        '$[*]' COLUMNS(player_id INT PATH '$')
                    ) AS jt
                );
                
                IF ROW_COUNT() = 0 AND JSON_LENGTH(p_player_ids) > 0 THEN
                    SET v_success = FALSE;
                END IF;
        END CASE;

         IF v_success THEN
            COMMIT;
        ELSE
            ROLLBACK;
        END IF;

        SET v_in_transaction = FALSE;
    END IF;

    IF v_success THEN
        SELECT JSON_OBJECT(
            'status', TRUE,
            'playerId', v_auction_owner_id,
            'categoryName', v_category_name,
            'name', v_auction_name
        ) AS result;
    ELSE
        IF v_access_denied THEN
            SELECT JSON_OBJECT('status', FALSE, 'isAccessDenied', TRUE) AS result;
        ELSEIF v_auction_live_flag THEN
            SELECT JSON_OBJECT('status', FALSE, 'isLive', TRUE) AS result;
        ELSEIF v_not_found THEN
            SELECT JSON_OBJECT('status', FALSE, 'isNotFound', TRUE) AS result;
        ELSE
            SELECT JSON_OBJECT('status', FALSE, 'isError', TRUE) AS result;
        END IF;
    END IF;

END$$

DELIMITER ;