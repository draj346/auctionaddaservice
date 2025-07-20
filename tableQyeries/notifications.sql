CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  playerId INT NOT NULL, -- For whome the notification is
  submittedBy INT NOT NULL, -- Who triggered the notification
  message VARCHAR(50) NOT NULL,
  role VARCHAR(10) NOT NULL,
  type VARCHAR(30) NOT NULL,
  isRead BOOLEAN DEFAULT false,
  customAttributes JSON DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_notification_user
    FOREIGN KEY (playerId) REFERENCES players(playerId)
    ON DELETE CASCADE,
  CONSTRAINT fk_notification_source
    FOREIGN KEY (submittedBy) REFERENCES players(playerId)
    ON DELETE CASCADE,
  INDEX idx_user_created (playerId, createdAt DESC),
  INDEX idx_unread (playerId, isRead)
);

CREATE TABLE pending_updates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  playerId INT NOT NULL, -- For whome the notification is
  submittedBy INT NOT NULL, -- Who triggered the notification
  updatedData JSON NOT NULL,
  previousData JSON NOT NULL,
  message VARCHAR(50) NOT NULL,
  role VARCHAR(10) NOT NULL,
  type VARCHAR(30) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pending_player
    FOREIGN KEY (playerId) REFERENCES players(playerId)
    ON DELETE CASCADE,
  CONSTRAINT fk_pending_submitter
    FOREIGN KEY (submittedBy) REFERENCES players(playerId)
    ON DELETE CASCADE,
  INDEX idx_submitted_status (submittedBy, status),
  INDEX idx_player_status (playerId, status)
);