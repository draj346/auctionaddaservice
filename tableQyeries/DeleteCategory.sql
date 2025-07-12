DELIMITER $$

CREATE PROCEDURE DeleteCategory(IN p_category_id INT)
BEGIN
    DECLARE v_auction_id INT;
    DECLARE v_blocked BOOLEAN DEFAULT FALSE;
    DECLARE v_batch_size INT DEFAULT 10000;
    DECLARE v_rows_affected INT DEFAULT 1;
    DECLARE v_success BOOLEAN DEFAULT TRUE;
    DECLARE v_in_transaction BOOLEAN DEFAULT FALSE;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        IF v_in_transaction THEN
            ROLLBACK;
            SET v_in_transaction = FALSE;
        END IF;
        SET v_success = FALSE;
    END;
    
    SELECT ac.auctionId INTO v_auction_id
    FROM auction_category ac 
    WHERE ac.categoryId = p_category_id;
    
    IF v_auction_id IS NULL THEN
        SET v_success = FALSE;
    END IF;
    
    IF v_success THEN
        SELECT EXISTS (
            SELECT 1
            FROM auctions 
            WHERE auctionId = v_auction_id
              AND paymentStatus = TRUE
              AND isLive = TRUE
        ) INTO v_blocked;
        
        IF v_blocked THEN
            SET v_success = FALSE;
        END IF;
    END IF;
    
    IF v_success THEN
        START TRANSACTION;
        SET v_in_transaction = TRUE;
        
        SELECT paymentStatus, isLive
        INTO v_blocked, v_blocked
        FROM auctions 
        WHERE auctionId = v_auction_id
        FOR UPDATE;
        
        SELECT EXISTS (
            SELECT 1
            FROM auctions 
            WHERE auctionId = v_auction_id
              AND paymentStatus = TRUE
              AND isLive = TRUE
        ) INTO v_blocked;
        
        IF v_blocked THEN
            ROLLBACK;
            SET v_in_transaction = FALSE;
            SET v_success = FALSE;
        END IF;
    END IF;
    
    IF v_success THEN
        batch_loop: LOOP
            UPDATE auction_category_player
            SET categoryId = NULL
            WHERE categoryId = p_category_id
            LIMIT v_batch_size;
            
            SET v_rows_affected = ROW_COUNT();
            
            IF v_rows_affected = 0 THEN
                LEAVE batch_loop;
            END IF;
            
            COMMIT;
            SET v_in_transaction = FALSE;
            START TRANSACTION;
            SET v_in_transaction = TRUE;
        END LOOP;
        
        DELETE FROM auction_category
        WHERE categoryId = p_category_id
        LIMIT 1;
        
        COMMIT;
        SET v_in_transaction = FALSE;
    END IF;
    
    SELECT JSON_OBJECT('status', v_success) AS result;
END$$

DELIMITER ;