import { PlayerRole, ROLES } from "../constants/roles.constants";
import { RoleHelper } from "../helpers/roles.helpers";
import * as XLSX from "xlsx";

const queries = {
  getPlayers: (role: PlayerRole,  userId: number) => {
    return `SELECT 
        p.playerId, p.name, p.mobile, p.email
        ${RoleHelper.isOrganiserAndOwner(role) ? ", p.pricePerMatch" : ""}
        ${RoleHelper.isOrganiser(role) ? ", p.willJoinAnyOwner" : ""},
        ${RoleHelper.isOrganiser(role) ? "1 as status" : `(p.playerId = ${userId}) AS status`}
      FROM players p
      WHERE p.isApproved = 1 
        AND p.isActive = 1
        AND (
          p.isNonPlayer = 0 
          OR p.playerId = ${userId} 
        )
        AND NOT EXISTS (
          SELECT 1 
          FROM player_role pr 
          JOIN roles r ON pr.roleId = r.roleId
          WHERE pr.playerId = p.playerId 
            AND r.name IN ('SUPER_ADMIN', 'ADMIN')
        )
      ORDER BY 
        CASE WHEN p.playerId = ${userId} THEN 0 ELSE 1 END,
        p.playerId ASC;`;
  },

  getAdminPlayers: (role: PlayerRole, isActive: boolean, userId: number) => {
    return `
      SELECT p.playerId, p.name, p.mobile, p.email, p.pricePerMatch, p.willJoinAnyOwner,
             p.isApproved, p.isNonPlayer, 1 as status
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
        } ORDER BY 
        CASE WHEN p.playerId = ${userId} THEN 0 ELSE 1 END,
        p.playerId ASC`;
  },

  getPlayerDetails: (role: PlayerRole, playerId: number) => {
    return `
      SELECT 
        p.playerId, p.name, p.mobile, p.email, 
        p.jerseyNumber, p.tShirtSize, p.lowerSize, 
        p.hasCricheroesProfile, url
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
        p.isNonPlayer, url
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
  },
  getPlayersForExport: (ids: string) => {
    let query = `SELECT 
                name AS "Full Name",
                mobile AS "Mobile",
                email AS "Email",
                jerseyNumber AS "Jersey Number",
                tShirtSize AS "T-Shirt Size",
                lowerSize AS "Lower Size",
                CASE 
                  WHEN hasCricheroesProfile THEN 'True'
                  ELSE 'False'
                END AS "Has Cricheroes Profile",
                CASE 
                  WHEN isPaidPlayer THEN 'True'
                  ELSE 'False'
                END AS "Is Paid Player",
                pricePerMatch AS "Price Per Match",
                CASE 
                  WHEN willJoinAnyOwner THEN 'True'
                  ELSE 'False'
                END AS "Will Join Any Owner",
                CASE 
                  WHEN isActive THEN 'True'
                  ELSE 'False'
                END AS "Status"
              FROM players`;

    if (!!ids) {
      query += ` WHERE playerId IN (${ids})`;
    }

    return query;
  },
};

export class PlayerQueries {
  public static getPlayers = (role: PlayerRole, isActive: boolean, userId: number) => {
    if (RoleHelper.isAdminAndAbove(role)) {
      return queries.getAdminPlayers(role, isActive, userId);
    }
    return queries.getPlayers(role, userId);
  };

  public static getPlayerById = (role: PlayerRole, playerId: number) => {
    if (RoleHelper.isAdminAndAbove(role)) {
      return queries.getAdminPlayerDetails(role, playerId);
    }
    return queries.getPlayerDetails(role, playerId);
  };

  public static approvePlayer = (playerIds: number[]) => {
    return queries.approvePlayer(playerIds.join());
  };

  public static getPlayerForExport = (playerIds: number[]) => {
    return queries.getPlayersForExport(playerIds.join());
  };
}
