import { PlayerRole, ROLES } from "../constants/roles.constants";
import { RoleHelper } from "../helpers/roles.helpers";
import * as XLSX from "xlsx";

const queries = {
  getPlayers: (
    role: PlayerRole,
    userId: number,
    where: string,
    offset: number,
    limit: number,
    orderBy: string
  ) => {
    return `SELECT 
        p.playerId, p.name, p.mobile, p.email
        ${RoleHelper.isOrganiserAndOwner(role) ? ", p.pricePerMatch" : ""}
        ${RoleHelper.isOrganiser(role) ? ", p.willJoinAnyOwner" : ""},
        ${
          RoleHelper.isOrganiser(role)
            ? "1 as status"
            : `(p.playerId = ${userId}) AS status`
        }
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
        ) ${where}
      ORDER BY ${orderBy}
      LIMIT ${limit}
      OFFSET ${offset}`;
  },

  getAdminPlayers: (
    role: PlayerRole,
    isActive: boolean,
    where: string,
    offset: number,
    limit: number,
    orderBy: string
  ) => {
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
        } ${where}
      ORDER BY ${orderBy}
      LIMIT ${limit}
      OFFSET ${offset}`;
  },

  getCountPlayers: (userId: number, where: string) => {
    return `SELECT count(*) as total
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
        ${where ? ` ${where}` : ""}
      `;
  },

  getCountAdminPlayers: (
    role: PlayerRole,
    isActive: boolean,
    where: string
  ) => {
    return `
      SELECT  count(*) as total
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
        } ${where}
      `;
  },

  getPlayerDetails: (role: PlayerRole, playerId: number, userId: number) => {
    return `
      SELECT 
        p.playerId, p.name, p.mobile, p.email, 
        p.jerseyNumber, p.tShirtSize, p.lowerSize, 
        p.hasCricheroesProfile, url as image, f.fileId
        ${playerId === userId 
            ? ", p.isPaidPlayer, p.pricePerMatch, p.willJoinAnyOwner" 
            : (RoleHelper.isOrganiserAndOwner(role) 
                ? ", p.isPaidPlayer, p.pricePerMatch" 
                : "") +
              (RoleHelper.isOrganiser(role) && playerId !== userId 
                ? ", p.willJoinAnyOwner" 
                : "")
        }
      FROM players p 
      LEFT JOIN files f ON p.image = f.fileId
      WHERE p.playerId = ${playerId}
        AND (
          p.isNonPlayer = 0 
          OR p.playerId = ${playerId} 
        )
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

  getAdminPlayerDetails: (role: PlayerRole, playerId: number,  isActive: boolean) => {
    return `
      SELECT 
        p.playerId, p.name, p.mobile, p.email, p.jerseyNumber, 
        p.tShirtSize, p.lowerSize, p.hasCricheroesProfile, p.isPaidPlayer,
        p.pricePerMatch, p.willJoinAnyOwner, p.isApproved, 
        p.isNonPlayer, url as image, f.fileId
      FROM players p 
      LEFT JOIN files f ON p.image = f.fileId
      WHERE p.playerId = ${playerId}
        AND p.isActive = ${isActive ? 1 : 0}
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
  private static buildWhereClause(
    search: string,
    owner: string,
    approved: string
  ): string {
    let where = "";
    if (search) {
      where += ` AND (p.name LIKE '%${search}%' 
               OR p.email LIKE '%${search}%' 
               OR p.mobile LIKE '%${search}%') `;
    }

    if (owner !== "all") {
      where += ` AND p.willJoinAnyOwner = ${owner === "Yes" ? 1 : 0} `;
    }

    if (approved !== "all") {
      where += ` AND p.isApproved = ${approved === "Yes" ? 1 : 0} `;
    }

    return where;
  }

  private static buildOrderByClause(sort: string, userId: number): string {
    const defaultSort = `CASE WHEN p.playerId = ${userId} THEN 0 ELSE 1 END, p.playerId ASC`;
    
    if (!sort) return defaultSort;

    const sortRules = sort.split(',');
    const orderBy = sortRules
      .map(rule => {
        const [field, direction] = rule.split(':');
        const safeDirection = direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        
        switch (field) {
          case 'name': return `p.name ${safeDirection}`;
          case 'email': return `p.email ${safeDirection}`;
          case 'mobile': return `p.mobile ${safeDirection}`;
          case 'pricePerMatch': return `p.pricePerMatch ${safeDirection}`;
          default: return null;
        }
      })
      .filter(Boolean)
      .join(', ');

    return orderBy || defaultSort;
  }

  public static getPlayers = (
    role: PlayerRole,
    isActive: boolean,
    userId: number,
    search: string,
    owner: string,
    approved: string,
    offset: number,
    limit: number,
    sort: string
  ) => {
    const where = this.buildWhereClause(search, owner, approved);
    const orderBy = this.buildOrderByClause(sort || '', userId);

    if (RoleHelper.isAdminAndAbove(role)) {
      const query =  queries.getAdminPlayers(role, isActive, where, offset, limit, orderBy);
      return query;
    }
    const query =  queries.getPlayers(role, userId, where, offset, limit, orderBy);
    return query;
  };

  public static getPlayersCount = (
    role: PlayerRole,
    isActive: boolean,
    userId: number,
    search: string,
    owner: string,
    approved: string
  ) => {
    const where = this.buildWhereClause(search, owner, approved);

    if (RoleHelper.isAdminAndAbove(role)) {
      return queries.getCountAdminPlayers(role, isActive, where);
    }
    return queries.getCountPlayers(userId, where);
  };

  public static getPlayerById = (role: PlayerRole, playerId: number, isActive: boolean, userId: number) => {
    if (RoleHelper.isAdminAndAbove(role)) {
      return queries.getAdminPlayerDetails(role, playerId, isActive);
    }
    return queries.getPlayerDetails(role, playerId, userId);
  };

  public static approvePlayer = (playerIds: number[]) => {
    return queries.approvePlayer(playerIds.join());
  };

  public static getPlayerForExport = (playerIds: number[]) => {
    return queries.getPlayersForExport(playerIds.join());
  };
}
