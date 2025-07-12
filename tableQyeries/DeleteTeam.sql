DELIMITER $$

CREATE PROCEDURE DeleteTeam(IN p_teamId INT)
BEGIN
    DECLARE v_auctionId INT;
    DECLARE v_paymentStatus BOOLEAN;
    DECLARE v_isLive BOOLEAN;
    DECLARE v_startDate DATE;
    DECLARE v_success BOOLEAN DEFAULT FALSE;
    DECLARE v_in_transaction BOOLEAN DEFAULT FALSE;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        IF v_in_transaction THEN
            ROLLBACK;
            SET v_in_transaction = FALSE;
        END IF;
        SET v_success = FALSE;
    END;
    
    SELECT a.auctionId, a.paymentStatus, a.isLive, a.startDate
    INTO v_auctionId, v_paymentStatus, v_isLive, v_startDate
    FROM teams t
    INNER JOIN auctions a ON t.auctionId = a.auctionId
    WHERE t.teamId = p_teamId;
    
    IF v_auctionId IS NULL THEN
        SET v_success = FALSE;
    ELSE
        IF (v_paymentStatus AND v_isLive AND v_startDate <= CURDATE()) THEN
            SET v_success = FALSE;
        ELSE
            START TRANSACTION;
            SET v_in_transaction = TRUE;
            
            SELECT 1
            FROM auctions 
            WHERE auctionId = v_auctionId
            FOR UPDATE;
            
            SELECT paymentStatus, isLive, startDate 
            INTO v_paymentStatus, v_isLive, v_startDate
            FROM auctions 
            WHERE auctionId = v_auctionId;
            
            IF (v_paymentStatus AND v_isLive AND v_startDate <= CURDATE()) THEN
                SET v_success = FALSE;
            ELSE
                DELETE FROM team_owner WHERE teamId = p_teamId;
                DELETE FROM team_wishlist WHERE teamId = p_teamId;
                DELETE FROM teams WHERE teamId = p_teamId;
                SET v_success = TRUE;
            END IF;
            
            COMMIT;
            SET v_in_transaction = FALSE;
        END IF;
    END IF;
    
    SELECT JSON_OBJECT('status', v_success) AS result;
END$$

DELIMITER ;