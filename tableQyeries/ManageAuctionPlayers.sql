DELIMITER $$

CREATE PROCEDURE ManageAuctionPlayers(
    IN p_operation ENUM('ASSIGN_AUCTION', 'ASSIGN_CATEGORY', 'REMOVE_CATEGORY', 'REMOVE_AUCTION'),
    IN p_auction_id INT,
    IN p_category_id INT,
    IN p_player_ids JSON
)
BEGIN
    DECLARE exit_handler BOOLEAN DEFAULT FALSE;
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        SET exit_handler = TRUE;
    END;

    START TRANSACTION;
    
    CASE p_operation
        WHEN 'ASSIGN_AUCTION' THEN
            INSERT IGNORE INTO auction_category_player (auctionId, playerId)
            SELECT p_auction_id, player_id
            FROM JSON_TABLE(
                p_player_ids,
                '$[*]' COLUMNS(player_id INT PATH '$')
            ) AS jt;
            
            IF ROW_COUNT() = 0 AND JSON_LENGTH(p_player_ids) > 0 THEN
                SET exit_handler = TRUE;
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
                SET exit_handler = TRUE;
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
                SET exit_handler = TRUE;
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
                SET exit_handler = TRUE;
            END IF;
    END CASE;

    IF exit_handler THEN
        ROLLBACK;
        SELECT JSON_OBJECT('status', FALSE) AS result;
    ELSE
        COMMIT;
        SELECT JSON_OBJECT('status', TRUE) AS result;
    END IF;
END$$

DELIMITER ;