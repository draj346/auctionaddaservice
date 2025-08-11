CREATE TABLE players (
  playerId INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  mobile VARCHAR(15) NOT NULL,
  email VARCHAR(50) NULL,
  isSubmitted BOOLEAN DEFAULT false,
  isApproved BOOLEAN DEFAULT false,
  state VARCHAR(30),
  district VARCHAR(50),
  isVerified BOOLEAN,
  modifiedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  isActive BOOLEAN DEFAULT true,
  isNonPlayer BOOLEAN DEFAULT false,
  UNIQUE KEY mobile_unique (mobile),
  UNIQUE KEY email_unique (email),
  INDEX idx_player_email (email),
  INDEX idx_player_mobile (mobile),
  INDEX idx_is_submitted (isSubmitted),
  INDEX idx_status_flags (isActive, isApproved, isNonPlayer),
  FULLTEXT INDEX idx_player_search (name, email, mobile),
  INDEX idx_image (image)
) AUTO_INCREMENT = 10001;

CREATE TABLE player_images (
  playerId INT PRIMARY KEY,
  imageId INT NOT NULL,
  modifiedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (playerId) REFERENCES players(playerId) ON DELETE CASCADE,
  INDEX idx_player_image (imageId)
) ENGINE=InnoDB;

CREATE TABLE player_informations (
  playerId INT PRIMARY KEY,
  jerseyNumber TINYINT UNSIGNED NULL,
  tShirtSize ENUM('XS','S','M','L','XL','XXL') NULL,
  lowerSize ENUM('XS','S','M','L','XL','XXL') NULL,
  hasCricheroesProfile BOOLEAN,
  isPaidPlayer BOOLEAN,
  pricePerMatch DECIMAL(6,2) UNSIGNED NULL,
  willJoinAnyOwner BOOLEAN,
  customAttributes JSON DEFAULT NULL,
  modifiedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (playerId) REFERENCES players(playerId),
  INDEX idx_will_join_owner (willJoinAnyOwner),
  INDEX idx_paid_player (isPaidPlayer),
  INDEX idx_price_match (pricePerMatch),
  INDEX idx_jersey_number (jerseyNumber),
  INDEX idx_tshirt_size (tShirtSize),
  INDEX idx_cricheroes (hasCricheroesProfile)
);

--Player Custom Attributes
-- playerRole -Top-order batter, Middle-order batter, Bowler, All-rounder, Lower-order batter, Opening batter, None
--battingStyle -Left-hand bat, Right-hand bat
--bowlingStyle -Right-aram fast, Right-aram medium, Left-aram fast, Left-aram medium, Slow left-arm orthodox, Slow left-arm chinaman, Right-arm Off Break, Right-arm Leg Break
--description VARCHAR(500)


CREATE TABLE roles (
  roleId INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE,
  INDEX idx_role_names (name)
) AUTO_INCREMENT=10001;

CREATE TABLE player_role (
  id  INT AUTO_INCREMENT PRIMARY KEY,
  playerId INT NOT NULL,
  roleId INT NOT NULL,
  UNIQUE KEY unique_player_role (playerId, roleId),
  INDEX idx_player (playerId),
  INDEX idx_role_player (roleId, playerId),
  FOREIGN KEY (playerId) 
    REFERENCES players(playerId) 
    ON DELETE CASCADE,
  FOREIGN KEY (roleId) 
    REFERENCES roles(roleId) 
    ON DELETE CASCADE
) AUTO_INCREMENT=10001;


CREATE TABLE player_auth (
  playerId INT PRIMARY KEY,
  passwordHash CHAR(60) NOT NULL COMMENT 'bcrypt hash (60 chars)',
  lastChanged TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  failedAttempts TINYINT UNSIGNED DEFAULT 0,
  lockedUntil TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  passwordVersion TINYINT DEFAULT 1 COMMENT 'Allow hash algorithm upgrades',
  FOREIGN KEY (playerId) 
    REFERENCES players(playerId) 
    ON DELETE CASCADE,
  INDEX idx_auth_lookup (playerId, lockedUntil)
) ENGINE=InnoDB;