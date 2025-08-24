DELIMITER $$

CREATE PROCEDURE ManageTeamPlayers(
    IN p_operation ENUM('RETAIN', 'NEW', 'REMOVE'),
    IN p_auction_id INT,
    IN p_team_id INT,
    IN p_player_ids JSON,
    IN p_price INT,
    IN p_requesterId INT, 
    IN p_admin BOOLEAN
)
BEGIN
    DECLARE v_auction_owner_id INT DEFAULT NULL;
    DECLARE v_team_name VARCHAR(255) DEFAULT NULL;
    DECLARE v_auction_live BOOLEAN DEFAULT FALSE;
    DECLARE v_max_player_per_team INT DEFAULT 0;
    DECLARE v_current_player_count INT DEFAULT 0;
    DECLARE v_new_player_count INT DEFAULT 0;
    DECLARE v_in_transaction BOOLEAN DEFAULT FALSE;
    DECLARE v_auction_live_flag BOOLEAN DEFAULT FALSE;
    DECLARE v_not_found BOOLEAN DEFAULT FALSE;
    DECLARE v_success BOOLEAN DEFAULT TRUE;
    DECLARE v_access_denied BOOLEAN DEFAULT FALSE;
    DECLARE v_limit_reached BOOLEAN DEFAULT FALSE;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        IF v_in_transaction THEN
            ROLLBACK;
            SET v_in_transaction = FALSE;
        END IF;
        SET v_success = FALSE;
    END;

    SELECT playerId, isLive, maxPlayerPerTeam
    INTO v_auction_owner_id, v_auction_live, v_max_player_per_team
    FROM auctions 
    WHERE auctionId = p_auction_id AND isActive IS TRUE;

    IF v_auction_owner_id IS NULL THEN
        SET v_not_found = TRUE;
        SET v_success = FALSE;
    ELSEIF (!p_admin AND v_auction_owner_id != p_requesterId) THEN
        SET v_access_denied = TRUE;
        SET v_success = FALSE;
    ELSEIF v_auction_live THEN
        SET v_auction_live_flag = TRUE;
        SET v_success = FALSE;
    END IF;

    IF v_success THEN
        SELECT name INTO v_team_name
        FROM teams
        WHERE teamId = p_team_id;

        IF ROW_COUNT() = 0 THEN
            SET v_not_found = TRUE;
            SET v_success = FALSE;
        END IF;
    END IF;

    IF v_success AND p_operation IN ('RETAIN', 'NEW') THEN
        SELECT COUNT(*) INTO v_current_player_count
        FROM auction_team_player
        WHERE teamId = p_team_id AND auctionId = p_auction_id;
        
        SET v_new_player_count = (
            SELECT COUNT(DISTINCT player_id)
            FROM JSON_TABLE(
                p_player_ids,
                '$[*]' COLUMNS(player_id INT PATH '$')
            ) AS jt
            WHERE player_id NOT IN (
                SELECT playerId 
                FROM auction_team_player 
                WHERE teamId = p_team_id AND auctionId = p_auction_id
            )
        );
        
        IF v_current_player_count + v_new_player_count > v_max_player_per_team THEN
            SET v_limit_reached = TRUE;
            SET v_success = FALSE;
        END IF;
    END IF;

    IF v_success THEN
        START TRANSACTION;
        SET v_in_transaction = TRUE;
        
        CASE 
            WHEN p_operation IN ('RETAIN', 'NEW') THEN
                INSERT INTO auction_team_player (teamId, playerId, price, auctionId, status)
                SELECT p_team_id, player_id, p_price, p_auction_id, p_operation
                FROM JSON_TABLE(
                    p_player_ids,
                    '$[*]' COLUMNS(player_id INT PATH '$')
                ) AS jt
                ON DUPLICATE KEY UPDATE 
                    price = VALUES(price),
                    status = VALUES(status);

                UPDATE auction_category_player set status = 'SOLD'
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

            WHEN p_operation = 'REMOVE' THEN 
                DELETE FROM auction_team_player
                WHERE auctionId = p_auction_id
                AND teamId = p_team_id
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
            'name', v_team_name
        ) AS result;
    ELSE
        IF v_limit_reached THEN
            SELECT JSON_OBJECT('status', FALSE, 'limitReached', TRUE) AS result;
        ELSEIF v_access_denied THEN
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