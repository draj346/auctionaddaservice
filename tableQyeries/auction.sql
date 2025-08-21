CREATE TABLE auctions (
  auctionId INT AUTO_INCREMENT PRIMARY KEY,
  imageId INT NULL,
  name VARCHAR(255) NOT NULL,
  state VARCHAR(30),
  district VARCHAR(50),
  paymentStatus BOOLEAN DEFAULT false,
  startDate DATE DEFAULT NULL,
  startTime VARCHAR(10) DEFAULT NULL,
  maxPlayerPerTeam INT Not Null,
  minPlayerPerTeam INT default 11,
  season INT,
  playerId INT NOT NULL,
  code VARCHAR(20),
  isLive BOOLEAN DEFAULT false, 
  isCompleted BOOLEAN DEFAULT false, 
  pointPerTeam INT NOT NULL,
  baseBid INT NOT NULL,
  baseIncreaseBy INT NOT NULL,
  customAttributes JSON DEFAULT NULL,
  defCategoryDisplayOrderId INT,
  isPaymentInCompanyAccount BOOLEAN DEFAULT true,
  qrCodeId INT NULL,
  auctionRule TEXT DEFAULT NULL,
  players_selection_rule ENUM('RANDOM', 'MANUAL', 'SEQUENCE') Default 'RANDOM',
  modifiedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  isActive BOOLEAN DEFAULT true,
  FOREIGN KEY (playerId) REFERENCES players(playerId) ON DELETE CASCADE,
  INDEX (startDate),
  UNIQUE INDEX idx_code (code),
  INDEX idx_auction_owner (auctionId, playerId),
  INDEX idx_auction_status (auctionId, paymentStatus, isLive),
  INDEX idx_auction_active_status (auctionId, isActive, isLive),
  INDEX idx_auction_status_active (playerId, paymentStatus, isActive),
  INDEX idx_auction_active (playerId, isActive)
) AUTO_INCREMENT=1001;

CREATE TABLE transactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  auctionId INTEGER UNIQUE REFERENCES auctions(auctionId),
  amount DECIMAL(10,2) NOT NULL,
  transactionId VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (auctionId) REFERENCES auctions(auctionId) ON DELETE CASCADE
);

CREATE TABLE teams (
  teamId INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  shortName VARCHAR(30) NOT NULL,
  image INT,
  shortcutKey CHAR(1) NOT NULL,
  auctionId INT NOT NULL,
  modifiedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  isActive BOOLEAN DEFAULT true,
  INDEX (isActive),
  INDEX (name),
  INDEX (shortName),
  INDEX auctionId_idx (auctionId),
  INDEX idx_teams_active (auctionId, isActive, teamId)
) AUTO_INCREMENT=1001;

CREATE TABLE team_owner (
  id INT AUTO_INCREMENT PRIMARY KEY,
  auctionId INT NOT NULL,
  teamId INT NOT NULL,
  ownerId INT NOT NULL,
  tag ENUM('OWNER','CO-OWNER') NOT NULL,
  UNIQUE KEY `unique_team_owner` (`auctionId`,`teamId`,`ownerId`,`tag`),
  INDEX (ownerId),
  INDEX teamId_idx (teamId),
  INDEX (auctionId),
  FOREIGN KEY (auctionId) REFERENCES auctions(auctionId) ON DELETE CASCADE,
  FOREIGN KEY (teamId) REFERENCES teams(teamId) ON DELETE CASCADE,
  FOREIGN KEY (ownerId) REFERENCES players(playerId) ON DELETE CASCADE
) AUTO_INCREMENT=1001;

CREATE TABLE auction_category (
  categoryId INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  auctionId INT NOT NULL,
  maxPlayer INT,
  minPlayer INT,
  baseBid INT,
  reserveBid INT,
  highestBid INT,
  categoryHighestBid INT,
  increments JSON DEFAULT NULL,
  modifiedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (auctionId),
  INDEX (name),
  FOREIGN KEY (auctionId) REFERENCES auctions(auctionId) ON DELETE CASCADE,
  INDEX idx_categories_auction (auctionId, categoryId)
) AUTO_INCREMENT=1001;

CREATE TABLE auction_category_player (
  id INT AUTO_INCREMENT PRIMARY KEY,
  auctionId INT NOT NULL,
  categoryId INT,
  playerId INT NOT NULL,
  baseBid INT,
  status ENUM('SOLD', 'AVAILABLE', 'UNSOLD') DEFAULT NULL,
  star BOOLEAN DEFAULT FALSE,
  isApproved BOOLEAN DEFAULT FALSE,
  paymentId INT DEFAULT NULL,
  INDEX idx_category (categoryId),
  INDEX idx_auction_player (auctionId, playerId, categoryId),
  UNIQUE KEY unique_auction_player (auctionId, playerId),
  FOREIGN KEY (auctionId) REFERENCES auctions(auctionId) ON DELETE CASCADE,
  FOREIGN KEY (categoryId) REFERENCES auction_category(categoryId) ON DELETE CASCADE
) AUTO_INCREMENT=1001;

CREATE TABLE team_wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  auctionId INT NOT NULL,
  teamId INT NOT NULL,
  playerId INT NOT NULL,
  tag ENUM('Captain','Vice Captain', 'Player') DEFAULT 'Player',
  INDEX (playerId),
  INDEX (auctionId),
  INDEX teamId_idx (teamId),
  UNIQUE KEY unique_team_wish (teamId, playerId),
  FOREIGN KEY (auctionId) REFERENCES auctions(auctionId) ON DELETE CASCADE,
  FOREIGN KEY (teamId) REFERENCES teams(teamId) ON DELETE CASCADE
) AUTO_INCREMENT=1001;

CREATE TABLE player_feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  playerId INT NOT NULL,
  feedback VARCHAR(500) NOT NULL,
  teamId INT NOT NULL,
  providedBy INT NOT NULL,
  modifiedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  isActive BOOLEAN DEFAULT true,
  INDEX (playerId),
  INDEX (teamId),
  INDEX (providedBy),
  INDEX (isActive),
  FOREIGN KEY (playerId) REFERENCES players(playerId) ON DELETE CASCADE,
  FOREIGN KEY (teamId) REFERENCES teams(teamId) ON DELETE CASCADE,
  FOREIGN KEY (providedBy) REFERENCES players(playerId) ON DELETE CASCADE
) AUTO_INCREMENT=1001;

CREATE TABLE auction_team_player (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teamId INT NOT NULL,
  playerId INT NOT NULL,
  price INT DEFAULT 0,
  auctionId INT NOT NULL,
  isPaymentDone BOOLEAN DEFAULT false,
  INDEX (teamId),
  INDEX (playerId),
  INDEX (auctionId),
  UNIQUE KEY unique_team_player_auction (teamId, playerId, auctionId),
  FOREIGN KEY (teamId) REFERENCES teams(teamId) ON DELETE CASCADE,
  FOREIGN KEY (playerId) REFERENCES players(playerId) ON DELETE CASCADE,
  FOREIGN KEY (auctionId) REFERENCES auctions(auctionId) ON DELETE CASCADE
) AUTO_INCREMENT=1001;

CREATE TABLE auction_team_penalty_booster (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teamId INT NOT NULL,
  auctionId INT NOT NULL, 
  pointAdjustment INT DEFAULT 0,
  INDEX (teamId),
  INDEX (auctionId),
  FOREIGN KEY (teamId) REFERENCES teams(teamId) ON DELETE CASCADE,
  FOREIGN KEY (auctionId) REFERENCES auctions(auctionId) ON DELETE CASCADE
) AUTO_INCREMENT=1001;
