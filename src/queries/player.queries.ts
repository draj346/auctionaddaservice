import { PlayerRole, ROLES } from "../constants/roles.constants";
import { RoleHelper } from "../helpers/roles.helpers";

const queries = {
  getPlayers: (role: PlayerRole) => {
    
    return `
      SELECT 
        p.playerId, p.name, p.mobile, p.email
        ${RoleHelper.isOrganiserAndOwner(role) ? ", p.pricePerMatch" : ""}
        ${RoleHelper.isOrganiser(role) ? ", p.willJoinAnyOwner" : ""}
      FROM players p
      WHERE p.isNonPlayer = 0 
        AND p.isApproved = 1 
        AND p.isActive = 1
        AND NOT EXISTS (
          SELECT 1 
          FROM player_role pr 
          JOIN roles r ON pr.roleId = r.roleId
          WHERE pr.playerId = p.playerId 
            AND r.name IN ('SUPER_ADMIN', 'ADMIN')
        )`;
  },

  getAdminPlayers: (role: PlayerRole, isActive: boolean) => {
    return `
      SELECT p.playerId, p.name, p.mobile, p.email, 
             p.isApproved, p.isNonPlayer
      FROM players p
      WHERE p.isActive = ${isActive ? 1 : 0}
        ${
          RoleHelper.isSuperAdmin(role)
            ? ""
            : `AND NOT EXISTS (
          SELECT 1 
          FROM player_role pr 
          JOIN roles r ON pr.roleId = r.roleId
          WHERE pr.playerId = p.playerId 
            AND r.name = 'SUPER_ADMIN'
        )`
        }`;
  },

  getPlayerDetails: (role: PlayerRole, playerId: number) => {
    return `
      SELECT 
        p.playerId, p.name, p.mobile, p.email, 
        p.jerseyNumber, p.tShirtSize, p.lowerSize, 
        p.hasCricheroesProfile,
        COALESCE(f.url, 'default.jpg') AS url
        ${RoleHelper.isOrganiserAndOwner(role) ? ", p.pricePerMatch" : ""}
        ${RoleHelper.isOrganiser(role) ? ", p.willJoinAnyOwner" : ""}
      FROM players p 
      LEFT JOIN files f ON p.image = f.fileId
      WHERE p.playerId = ${playerId}
        AND p.isNonPlayer = 0 
        AND p.isApproved = 1 
        AND p.isActive = 1
        AND NOT EXISTS (
          SELECT 1 
          FROM player_role pr 
          JOIN roles r ON pr.roleId = r.roleId
          WHERE pr.playerId = p.playerId 
            AND r.name IN ('SUPER_ADMIN', 'ADMIN')
        )`;
  },

  getAdminPlayerDetails: (role: PlayerRole, playerId: number) => {
    return `
      SELECT 
        p.playerId, p.name, p.mobile, p.email, p.jerseyNumber, 
        p.tShirtSize, p.lowerSize, p.hasCricheroesProfile,
        p.pricePerMatch, p.willJoinAnyOwner, p.isApproved, 
        p.isNonPlayer, COALESCE(f.url, 'default.jpg') AS url
      FROM players p 
      LEFT JOIN files f ON p.image = f.fileId
      WHERE p.playerId = ${playerId}
        ${
          RoleHelper.isSuperAdmin(role)
            ? ""
            : `AND NOT EXISTS (
          SELECT 1 
          FROM player_role pr 
          JOIN roles r ON pr.roleId = r.roleId
          WHERE pr.playerId = p.playerId 
            AND r.name = 'SUPER_ADMIN'
        )`
        }`;
  },

  approvePlayer: (ids: string) => {
     return `update players set isApproved = 1 where playerId IN (${ids})`;
  }
};

export class PlayerQueries {
  public static  getPlayers = (role: PlayerRole, isActive: boolean) => {
    if (RoleHelper.isAdminAndAbove(role)) {
        return queries.getAdminPlayers(role, isActive);
    }
    return queries.getPlayers(role);
  }

  public static  getPlayerById = (role: PlayerRole, playerId: number) => {
    if (RoleHelper.isAdminAndAbove(role)) {
        return queries.getAdminPlayerDetails(role, playerId);
    }
    return queries.getPlayerDetails(role, playerId);
  }

  public static approvePlayer = (playerIds: number[]) => {
    return queries.approvePlayer(playerIds.join())
  }
}

