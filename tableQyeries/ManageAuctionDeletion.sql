DELIMITER $$

CREATE PROCEDURE AuctionDeletion(IN p_auctionId INT, IN p_playerId INT, IN p_admin BOOLEAN)
BEGIN
    DECLARE v_paymentStatus BOOLEAN;
    DECLARE v_isLive BOOLEAN;
    DECLARE v_startDate DATE;
    DECLARE v_playerId INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    SELECT paymentStatus, isLive, startDate, playerId
    INTO v_paymentStatus, v_isLive, v_startDate, v_playerId
    FROM auctions 
    WHERE auctionId = p_auctionId;
    
    IF (!p_admin AND v_playerId != p_playerId) THEN
        COMMIT;
        SELECT JSON_OBJECT('isAccessDenied', TRUE, 'status', FALSE) AS result;
    ELSEIF (v_paymentStatus = TRUE AND v_isLive = TRUE AND v_startDate < CURDATE()) THEN
        COMMIT;
        SELECT JSON_OBJECT('isLive', TRUE, 'status', FALSE) AS result;
    ELSEIF (v_paymentStatus = TRUE) THEN
        UPDATE auctions SET isActive = FALSE WHERE auctionId = p_auctionId;
        COMMIT;
        SELECT JSON_OBJECT('status', TRUE) AS result;
    ELSE
        SELECT 1 FROM auctions WHERE auctionId = p_auctionId FOR UPDATE;
        
        DELETE t FROM transactions t WHERE t.auctionId = p_auctionId;
        
        DELETE FROM team_wishlist WHERE auctionId = p_auctionId;
        DELETE FROM team_owner WHERE auctionId = p_auctionId;
        DELETE FROM teams WHERE auctionId = p_auctionId;
        DELETE FROM auction_category_player WHERE auctionId = p_auctionId;
        DELETE FROM auction_category WHERE auctionId = p_auctionId;
        DELETE FROM auctions WHERE auctionId = p_auctionId;
        
        COMMIT;
        SELECT JSON_OBJECT('status', TRUE) AS result;
    END IF;
END$$

DELIMITER ;