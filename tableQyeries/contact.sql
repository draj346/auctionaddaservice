CREATE TABLE contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  mobile VARCHAR(15) NOT NULL,
  email VARCHAR(50) NULL,
  subject VARCHAR(200),
  message VARCHAR(500),
  isWorkDone BOOLEAN DEFAULT false,
  playerId INT,
  modifiedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  isActive BOOLEAN DEFAULT true,
  FOREIGN KEY (playerId) REFERENCES players(playerId) ON DELETE CASCADE,
  INDEX idx_player_workdone_active (playerId, isWorkDone, isActive),
  INDEX idx_workdone (isWorkDone)
) AUTO_INCREMENT=1001;