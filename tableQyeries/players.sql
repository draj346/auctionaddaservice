CREATE TABLE players (
  playerId INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  mobile VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255) NULL UNIQUE,
  jerseyNumber VARCHAR(5),
  tShirtSize VARCHAR(10),
  lowerSize VARCHAR(10),
  hasCricheroesProfile BOOLEAN,
  isPaidPlayer BOOLEAN,
  pricePerMatch DECIMAL(10,2),
  willJoinAnyOwner BOOLEAN,
  image INT,
  isSubmitted BOOLEAN DEFAULT false,
  isApproved BOOLEAN DEFAULT false,
  modifiedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  isActive BOOLEAN DEFAULT true,
  isNonPlayer BOOLEAN DEFAULT false,
  password VARCHAR(255),
  INDEX (isActive),
  INDEX (isSubmitted),
  INDEX (isApproved),
  INDEX (isNonPlayer)
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