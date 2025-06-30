import { PlayerRole } from "../constants/roles.constants";
import { RoleHelper } from "../helpers/roles.helpers";

const queries = {
  getPlayers: (role: PlayerRole, userId: number, where: string, offset: number, limit: number, orderBy: string, isGlobalSearch: boolean) => {
    return `SELECT 
        p.playerId, p.name,
        CASE 
            WHEN p.playerId = ${userId} THEN p.mobile
            ELSE CONCAT(
                REPEAT('*', GREATEST(CHAR_LENGTH(p.mobile) - 4, 0)),
                SUBSTRING(p.mobile, -4)
            )
        END AS mobile,
        p.state, p.district, (p.playerId = ${userId}) AS status
      FROM players p
      ${
        isGlobalSearch
          ? ""
          : `JOIN (SELECT district 
                    FROM players 
                    WHERE playerId = ${userId}
                  ) user_district ON p.district = user_district.district`
      }
      WHERE 
        ${where ? "" : `p.playerId = ${userId} OR`}
        (
            p.isApproved = 1 
            AND p.isActive = 1
            AND NOT EXISTS (
              SELECT 1 
              FROM player_role pr 
              JOIN roles r ON pr.roleId = r.roleId
              WHERE pr.playerId = p.playerId 
                AND r.name IN ('SUPER_ADMIN', 'ADMIN')
          ) ${where}
        )
      ORDER BY ${orderBy}
      LIMIT ${limit}
      OFFSET ${offset}`;
  },

  getAdminPlayers: (role: PlayerRole, where: string, offset: number, limit: number, orderBy: string, active: string) => {
    return `
      SELECT p.playerId, p.name, p.mobile, p.state, p.district,
             p.isApproved, p.isVerified, p.isNonPlayer, p.isActive, 1 as status
      FROM players p
        WHERE 1=1
        ${active !== "all" ? ` AND p.isActive = ${active === "Yes" ? 1 : 0}` : ""}
        ${
          RoleHelper.isSuperAdmin(role)
            ? ""
            : ` AND NOT EXISTS (
                SELECT 1 
                FROM player_role pr 
                JOIN roles r ON pr.roleId = r.roleId
                WHERE pr.playerId = p.playerId 
                  AND r.name IN ('SUPER_ADMIN', 'ADMIN')
              )`
        } ${where}
      ORDER BY ${orderBy}
      LIMIT ${limit}
      OFFSET ${offset}`;
  },

  getCountPlayers: (userId: number, where: string, isGlobalSearch: boolean) => {
    return `SELECT count(*) as total
      FROM players p
      ${
        isGlobalSearch
          ? ""
          : `JOIN (SELECT district 
                    FROM players 
                    WHERE playerId = ${userId}
                  ) user_district ON p.district = user_district.district`
      }
      WHERE 
        ${where ? "" : `p.playerId = ${userId} OR`}
        (
            p.isApproved = 1 
            AND p.isActive = 1
            AND NOT EXISTS (
              SELECT 1 
              FROM player_role pr 
              JOIN roles r ON pr.roleId = r.roleId
              WHERE pr.playerId = p.playerId 
                AND r.name IN ('SUPER_ADMIN', 'ADMIN')
          ) ${where}
        )
      `;
  },

  getCountAdminPlayers: (role: PlayerRole, where: string, active: string) => {
    return `
      SELECT  count(*) as total
      FROM players p
      WHERE 1=1
        ${active !== "all" ? ` AND p.isActive = ${active === "Yes" ? 1 : 0}` : ""}
        ${
          RoleHelper.isSuperAdmin(role)
            ? ""
            : ` AND NOT EXISTS (
                SELECT 1 
                FROM player_role pr 
                JOIN roles r ON pr.roleId = r.roleId
                WHERE pr.playerId = p.playerId 
                  AND r.name IN ('SUPER_ADMIN', 'ADMIN')
              )`
        } ${where}
      `;
  },

  getPlayerDetails: (role: PlayerRole, playerId: number, userId: number) => {
    return `
      SELECT 
        p.playerId, p.name, p.state, p.district,
        pi.jerseyNumber, pi.tShirtSize, pi.lowerSize, pi.hasCricheroesProfile, 
        pi.isPaidPlayer, p.isVerified,
        p.isApproved, p.isNonPlayer,
        f.url AS image, f.fileId, (p.playerId = ${userId}) AS status
        ${
          playerId === userId
            ? ", p.mobile, p.email, pi.pricePerMatch, pi.willJoinAnyOwner"
            : (RoleHelper.isOrganiserAndOwner(role) ? ", pi.pricePerMatch" : "") +
              (RoleHelper.isOrganiser(role) && playerId !== userId ? ", pi.willJoinAnyOwner" : "")
        }
      FROM players p
      LEFT JOIN player_informations pi 
          ON p.playerId = pi.playerId
      LEFT JOIN player_images pimg 
          ON p.playerId = pimg.playerId
      LEFT JOIN files f 
        ON pimg.imageId = f.fileId
      WHERE 
        p.playerId = ${playerId} 
      OR
        (
            p.playerId = ${playerId} 
            AND p.isApproved = 1 
            AND p.isActive = 1
            AND NOT EXISTS (
              SELECT 1 
              FROM player_role pr 
              JOIN roles r ON pr.roleId = r.roleId
              WHERE pr.playerId = p.playerId 
                AND r.name IN ('SUPER_ADMIN', 'ADMIN')
          )
        )`;
  },

  getAdminPlayerDetails: (role: PlayerRole, playerId: number) => {
    return `
    SELECT 
     p.playerId, p.name, p.state, p.district,
        pi.jerseyNumber, pi.tShirtSize, pi.lowerSize, pi.hasCricheroesProfile, 
        pi.isPaidPlayer, p.isVerified,
        p.isApproved, p.isNonPlayer,
        f.url AS image, f.fileId, 1 AS status , p.mobile, p.email, pi.pricePerMatch, pi.willJoinAnyOwner
    FROM players p
    LEFT JOIN player_informations pi 
        ON p.playerId = pi.playerId
    LEFT JOIN player_images pimg 
        ON p.playerId = pimg.playerId
    LEFT JOIN files f 
      ON pimg.imageId = f.fileId
    WHERE p.playerId = ${playerId}
      ${
        RoleHelper.isSuperAdmin(role)
          ? ""
          : `AND NOT EXISTS (
                SELECT 1 
                FROM player_role pr 
                JOIN roles r ON pr.roleId = r.roleId
                WHERE pr.playerId = p.playerId 
                  AND r.name IN ('SUPER_ADMIN', 'ADMIN')
              )`
      }`;
  },

  approvePlayer: (ids: string) => {
    return `update players set isApproved = 1 where playerId IN (${ids})`;
  },

  getPlayersForExport: (role: PlayerRole, ids: string) => {
    let query = `SELECT 
                p.name AS "Full Name",
                 ${
                   RoleHelper.isSuperAdmin(role)
                     ? `
                    mobile AS "Mobile",
                    email AS "Email",
                  `
                     : ""
                 }
                p.state AS "State",
                p.district AS "District",
                pi.jerseyNumber AS "Jersey Number",
                pi.tShirtSize AS "T-Shirt Size",
                pi.lowerSize AS "Lower Size",
                CASE 
                  WHEN pi.hasCricheroesProfile THEN 'True'
                  ELSE 'False'
                END AS "Has Cricheroes Profile",
                CASE 
                  WHEN pi.isPaidPlayer THEN 'True'
                  ELSE 'False'
                END AS "Is Paid Player",
                pi.pricePerMatch AS "Price Per Match",
                CASE 
                  WHEN pi.willJoinAnyOwner THEN 'True'
                  ELSE 'False'
                END AS "Will Join Any Owner",
                CASE 
                  WHEN p.isActive THEN 'True'
                  ELSE 'False'
                END AS "Status",
                CASE 
                  WHEN p.isVerified  THEN 'True'
                  ELSE 'False'
                END AS "Is Verified Player"
              FROM players p 
              LEFT JOIN player_informations pi 
                  ON p.playerId = pi.playerId`;

    if (!!ids) {
      query += ` WHERE p.playerId IN (${ids})`;
    }

    return query;
  },
};

export class PlayerQueries {
  private static buildWhereClause(search: string, approved: string): string {
    let where = "";
    if (search) {
      where += ` AND (p.name LIKE '%${search}%' 
               OR p.email LIKE '%${search}%' 
               OR p.mobile LIKE '%${search}%') `;
    }

    if (approved !== "all") {
      where += ` AND p.isApproved = ${approved === "Yes" ? 1 : 0} `;
    }

    return where;
  }

  private static buildOrderByClause(sort: string, userId: number): string {
    const defaultSort = `CASE WHEN p.playerId = ${userId} THEN 0 ELSE 1 END, p.playerId ASC`;

    if (!sort) return defaultSort;

    const sortRules = sort.split(",");
    const orderBy = sortRules
      .map((rule) => {
        const [field, direction] = rule.split(":");
        const safeDirection = direction.toUpperCase() === "DESC" ? "DESC" : "ASC";

        switch (field) {
          case "name":
            return `p.name ${safeDirection}`;
          case "email":
            return `p.email ${safeDirection}`;
          case "mobile":
            return `p.mobile ${safeDirection}`;
          default:
            return null;
        }
      })
      .filter(Boolean)
      .join(", ");

    return orderBy || defaultSort;
  }

  public static getPlayers = (
    role: PlayerRole,
    userId: number,
    search: string,
    approved: string,
    offset: number,
    limit: number,
    sort: string,
    active: string
  ) => {
    const where = this.buildWhereClause(search, approved);
    const orderBy = this.buildOrderByClause(sort || "", userId);

    if (RoleHelper.isAdminAndAbove(role)) {
      return queries.getAdminPlayers(role, where, offset, limit, orderBy, active);
    }
    return queries.getPlayers(role, userId, where, offset, limit, orderBy, !!search);
  };

  public static getPlayersCount = (role: PlayerRole, userId: number, search: string, approved: string, active: string) => {
    const where = this.buildWhereClause(search, approved);

    if (RoleHelper.isAdminAndAbove(role)) {
      return queries.getCountAdminPlayers(role, where, active);
    }
    return queries.getCountPlayers(userId, where, !!search);
  };

  public static getPlayerById = (role: PlayerRole, playerId: number, isActive: boolean, userId: number) => {
    if (RoleHelper.isAdminAndAbove(role)) {
      return queries.getAdminPlayerDetails(role, playerId);
    }
    return queries.getPlayerDetails(role, playerId, userId);
  };

  public static approvePlayer = (playerIds: number[]) => {
    return queries.approvePlayer(playerIds.join());
  };

  public static getPlayerForExport = (role: PlayerRole, playerIds: number[]) => {
    return queries.getPlayersForExport(role, playerIds.join());
  };
}
