DELIMITER $$

CREATE PROCEDURE AuctionDeletion(IN p_auctionId INT, IN p_playerId INT, IN p_admin BOOLEAN)
BEGIN
    DECLARE v_paymentStatus BOOLEAN;
    DECLARE v_isLive BOOLEAN;
    DECLARE v_playerId INT;
    DECLARE v_imageId INT DEFAULT NULL;
    DECLARE v_qrCodeId INT DEFAULT NULL;
    DECLARE v_imagePath VARCHAR(255) DEFAULT NULL;
    DECLARE v_name VARCHAR(255) DEFAULT NULL;
    DECLARE v_state VARCHAR(30) DEFAULT NULL;
    DECLARE v_code VARCHAR(20) DEFAULT NULL;
    DECLARE v_qrPath VARCHAR(255) DEFAULT NULL;
    DECLARE v_auctionExists BOOLEAN DEFAULT FALSE;
    DECLARE v_stillExists BOOLEAN DEFAULT FALSE;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

     SELECT EXISTS(
        SELECT 1 FROM auctions WHERE auctionId = p_auctionId
    ) INTO v_auctionExists;
    
     IF NOT v_auctionExists THEN
        ROLLBACK;
        SELECT JSON_OBJECT('status', FALSE, 'isNotFound', TRUE) AS result;
    ELSE
        START TRANSACTION;

        SELECT 
            paymentStatus, isLive, playerId, imageId, qrCodeId, name, state, code
        INTO 
            v_paymentStatus, v_isLive, v_playerId, v_imageId, v_qrCodeId, v_name, v_state, v_code
        FROM auctions 
        WHERE auctionId = p_auctionId
        FOR UPDATE SKIP LOCKED;

        IF ROW_COUNT() = 0 THEN
            SELECT EXISTS(
                SELECT 1 FROM auctions WHERE auctionId = p_auctionId
            ) INTO v_stillExists;
            
            ROLLBACK;
            
            IF v_stillExists THEN
                SELECT JSON_OBJECT('status', FALSE, 'isLocked', TRUE) AS result;
            ELSE
                SELECT JSON_OBJECT('status', FALSE, 'isNotFound', TRUE) AS result;
            END IF;
        ELSEIF (!p_admin AND v_playerId != p_playerId) THEN
            COMMIT;
            SELECT JSON_OBJECT('isAccessDenied', TRUE, 'status', FALSE) AS result;
        ELSEIF (v_paymentStatus = TRUE AND v_isLive = TRUE) THEN
            COMMIT;
            SELECT JSON_OBJECT('isLive', TRUE, 'status', FALSE) AS result;
        ELSEIF (v_paymentStatus = TRUE) THEN
            UPDATE auctions SET isActive = FALSE WHERE auctionId = p_auctionId;
            COMMIT;
            SELECT JSON_OBJECT('status', TRUE, 'name', v_name, 'state', v_state, 'code', v_code, 'playerId', v_playerId) AS result;
        ELSE
            IF v_imageId IS NOT NULL THEN
                SELECT path INTO v_imagePath FROM files WHERE fileId = v_imageId;
            END IF;
            
            IF v_qrCodeId IS NOT NULL THEN
                SELECT path INTO v_qrPath FROM files WHERE fileId = v_qrCodeId;
            END IF;

            DELETE t FROM transactions t WHERE t.auctionId = p_auctionId;
            DELETE FROM team_wishlist WHERE auctionId = p_auctionId;
            DELETE FROM team_owner WHERE auctionId = p_auctionId;
            DELETE FROM teams WHERE auctionId = p_auctionId;
            DELETE FROM auction_category_player WHERE auctionId = p_auctionId;
            DELETE FROM auction_category WHERE auctionId = p_auctionId;
            DELETE FROM auctions WHERE auctionId = p_auctionId;

            COMMIT;

            IF v_imageId IS NOT NULL OR v_qrCodeId IS NOT NULL THEN
                START TRANSACTION;
                IF v_imageId IS NOT NULL THEN
                    DELETE FROM files WHERE fileId = v_imageId;
                END IF;
                IF v_qrCodeId IS NOT NULL THEN
                    DELETE FROM files WHERE fileId = v_qrCodeId;
                END IF;
                COMMIT;
                
                SELECT JSON_OBJECT(
                    'status', TRUE,
                    'imagePath', v_imagePath,
                    'qrCodePath', v_qrPath,
                    'playerId', v_playerId, 
                    'name', v_name, 
                    'state', v_state, 
                    'code', v_code
                ) AS result;
            ELSE
                SELECT JSON_OBJECT(
                    'status', TRUE,
                    'playerId', v_playerId, 
                    'name', v_name, 
                    'state', v_state, 
                    'code', v_code
                    ) AS result;
            END IF;
        END IF;
    END IF;
END$$

DELIMITER ;