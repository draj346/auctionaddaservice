DELIMITER $$

CREATE PROCEDURE ResetAuctionPlayers(
    IN p_auction_id INT,
    IN p_requesterId INT, 
    IN p_admin BOOLEAN
)
BEGIN
    DECLARE v_auction_owner_id INT DEFAULT NULL;
    DECLARE v_is_live BOOLEAN DEFAULT FALSE;
    DECLARE v_not_found BOOLEAN DEFAULT FALSE;
    DECLARE v_access_denied BOOLEAN DEFAULT FALSE;
    DECLARE v_success BOOLEAN DEFAULT TRUE;
    DECLARE v_in_transaction BOOLEAN DEFAULT FALSE;
    DECLARE v_affected_rows INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        IF v_in_transaction THEN
            ROLLBACK;
            SET v_in_transaction = FALSE;
        END IF;
        SET v_success = FALSE;
        SELECT JSON_OBJECT('status', FALSE, 'isError', TRUE) AS result;
    END;

    SELECT playerId, isLive 
    INTO v_auction_owner_id, v_is_live
    FROM auctions 
    WHERE auctionId = p_auction_id AND isActive IS TRUE;

    IF v_auction_owner_id IS NULL THEN
        SET v_not_found = TRUE;
        SET v_success = FALSE;
    ELSEIF (!p_admin AND v_auction_owner_id != p_requesterId) THEN
        SET v_access_denied = TRUE;
        SET v_success = FALSE;
    END IF;

    IF v_success AND v_is_live THEN
        SELECT JSON_OBJECT('status', FALSE, 'isLive', TRUE) AS result;
        SET v_success = FALSE;
    END IF;

    IF v_success THEN
        START TRANSACTION;
        SET v_in_transaction = TRUE;

        UPDATE auction_category_player acp
        INNER JOIN auction_team_player atp 
            ON acp.auctionId = atp.auctionId AND acp.playerId = atp.playerId
        SET acp.status = 'AVAILABLE'
        WHERE atp.auctionId = p_auction_id 
        AND atp.status = 'NEW';

        DELETE FROM auction_team_player
        WHERE auctionId = p_auction_id 
        AND status = 'NEW';

        UPDATE auction_category_player acp
        INNER JOIN auction_team_player atp 
            ON acp.auctionId = atp.auctionId AND acp.playerId = atp.playerId
        SET acp.status = 'SOLD'
        WHERE atp.auctionId = p_auction_id 
        AND atp.status = 'RETAIN'
        AND atp.isActive = FALSE;

        UPDATE auction_team_player
        SET isActive = TRUE
        WHERE auctionId = p_auction_id 
        AND status = 'RETAIN';

        UPDATE auction_category_player acp
        SET acp.status = 'AVAILABLE'
        WHERE acp.auctionId = p_auction_id 
        AND acp.status = 'UNSOLD';

        COMMIT;
        SET v_in_transaction = FALSE;
        
        SELECT JSON_OBJECT('status', TRUE) AS result;
    ELSE
        IF v_access_denied THEN
            SELECT JSON_OBJECT('status', FALSE, 'isAccessDenied', TRUE) AS result;
        ELSEIF v_not_found THEN
            SELECT JSON_OBJECT('status', FALSE, 'isNotFound', TRUE) AS result;
        END IF;
    END IF;

END$$

DELIMITER ;