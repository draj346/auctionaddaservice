CREATE TABLE players (
  playerId INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  mobile VARCHAR(15) NOT NULL,
  email VARCHAR(50) NULL,
  jerseyNumber TINYINT UNSIGNED NULL,
  tShirtSize ENUM('XS','S','M','L','XL','XXL') NULL,
  lowerSize ENUM('XS','S','M','L','XL','XXL') NULL,
  hasCricheroesProfile BOOLEAN,
  isPaidPlayer BOOLEAN,
  pricePerMatch DECIMAL(6,2) UNSIGNED,
  willJoinAnyOwner BOOLEAN,
  image INT,
  isSubmitted BOOLEAN DEFAULT false,
  isApproved BOOLEAN DEFAULT false,
  modifiedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  isActive BOOLEAN DEFAULT true,
  isNonPlayer BOOLEAN DEFAULT false,
  password CHAR(60) NULL,
  UNIQUE KEY mobile_unique (mobile),
  UNIQUE KEY email_unique (email),
  INDEX idx_status_flags (isActive, isApproved, isNonPlayer),
  INDEX idx_image (image)
) AUTO_INCREMENT=10001;

CREATE TABLE roles (
  roleId INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE
) AUTO_INCREMENT=10001;

CREATE TABLE player_role (
  id  INT AUTO_INCREMENT PRIMARY KEY,
  playerId INT NOT NULL,
  roleId INT NOT NULL,
  UNIQUE KEY unique_player_role (playerId, roleId),
  INDEX idx_player (playerId),
  FOREIGN KEY (playerId) 
    REFERENCES players(playerId) 
    ON DELETE CASCADE,
  FOREIGN KEY (roleId) 
    REFERENCES roles(roleId) 
    ON DELETE CASCADE
) AUTO_INCREMENT=10001;