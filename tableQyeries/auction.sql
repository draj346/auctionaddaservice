CREATE TABLE auctions (
  auctionId INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image INT,
  startDate DATE DEFAULT NULL,
  endDate DATE DEFAULT NULL,
  isApproved BOOLEAN DEFAULT false,
  modifiedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  isActive BOOLEAN DEFAULT true,
  INDEX (isActive),
  INDEX (isApproved),
  INDEX (startDate),
  INDEX (endDate)
) AUTO_INCREMENT=10001;

CREATE TABLE auction_organiser (
  id INT AUTO_INCREMENT PRIMARY KEY,
  auctionId INT NOT NULL,
  playerId INT NOT NULL,
  UNIQUE KEY unique_auction_organiser (auctionId, playerId),
  INDEX (playerId),
  FOREIGN KEY (auctionId) REFERENCES auctions(auctionId) ON DELETE CASCADE
) AUTO_INCREMENT=10001;

CREATE TABLE teams (
  teamId INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  shortName VARCHAR(30) NOT NULL,
  image INT,
  shortcutKey VARCHAR(30) NOT NULL,
  modifiedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  isActive BOOLEAN DEFAULT true,
  INDEX (isActive),
  INDEX (name),
  INDEX (shortName)
) AUTO_INCREMENT=10001;

CREATE TABLE auction_team_owner (
  id INT AUTO_INCREMENT PRIMARY KEY,
  auctionId INT NOT NULL,
  teamId INT NOT NULL,
  ownerId INT NOT NULL,
  penalty INT DEFAULT 0,
  totalBalance INT DEFAULT 0,
  INDEX (auctionId),
  INDEX (teamId),
  INDEX (ownerId),
  UNIQUE KEY unique_auction_team (auctionId, teamId),
  FOREIGN KEY (auctionId) REFERENCES auctions(auctionId) ON DELETE CASCADE,
  FOREIGN KEY (teamId) REFERENCES teams(teamId) ON DELETE CASCADE
) AUTO_INCREMENT=10001;

CREATE TABLE auction_category (
  categoryId INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  modifiedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  isActive BOOLEAN DEFAULT true,
  auctionId INT NOT NULL,
  INDEX (auctionId),
  INDEX (isActive),
  INDEX (name),
  FOREIGN KEY (auctionId) REFERENCES auctions(auctionId) ON DELETE CASCADE
) AUTO_INCREMENT=10001;

CREATE TABLE auction_shortlist_player (
  id INT AUTO_INCREMENT PRIMARY KEY,
  auctionId INT NOT NULL,
  playerId INT NOT NULL,
  status ENUM('SOLD', 'AVAILABLE', 'UNSOLD') NOT NULL,
  INDEX (auctionId),
  INDEX (playerId),
  INDEX (status),
  INDEX auction_player_status (auctionId, status),
  UNIQUE KEY unique_auction_player (auctionId, playerId),
  FOREIGN KEY (auctionId) REFERENCES auctions(auctionId) ON DELETE CASCADE
) AUTO_INCREMENT=10001;

CREATE TABLE auction_category_player (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categoryId INT NOT NULL,
  playerId INT NOT NULL,
  INDEX (categoryId),
  INDEX (playerId),
  UNIQUE KEY unique_category_player (categoryId, playerId),
  FOREIGN KEY (categoryId) REFERENCES auction_category(categoryId) ON DELETE CASCADE
) AUTO_INCREMENT=10001;

CREATE TABLE auction_team_whishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teamId INT NOT NULL,
  playerId INT NOT NULL,
  INDEX (teamId),
  INDEX (playerId),
  UNIQUE KEY unique_team_wish (teamId, playerId),
  FOREIGN KEY (teamId) REFERENCES teams(teamId) ON DELETE CASCADE
) AUTO_INCREMENT=10001;

CREATE TABLE player_feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  playerId INT NOT NULL,
  feedback VARCHAR(500) NOT NULL,
  teamId INT NOT NULL,
  createdBy INT NOT NULL,
  modifiedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  isActive BOOLEAN DEFAULT true,
  INDEX (playerId),
  INDEX (teamId),
  INDEX (createdBy),
  INDEX (isActive),
  FOREIGN KEY (teamId) REFERENCES teams(teamId) ON DELETE CASCADE
) AUTO_INCREMENT=10001;

CREATE TABLE auction_team_player (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teamId INT NOT NULL,
  playerId INT NOT NULL,
  price INT DEFAULT 0,
  INDEX (teamId),
  INDEX (playerId),
  UNIQUE KEY unique_team_player (teamId, playerId),
  FOREIGN KEY (teamId) REFERENCES teams(teamId) ON DELETE CASCADE
) AUTO_INCREMENT=10001;