import { PlayerRole } from "../constants/roles.constants";
import { RoleHelper } from "../helpers/roles.helpers";

const queries = {
  getPlayers: (
    role: PlayerRole,
    userId: number,
    where: string,
    offset: number,
    limit: number,
    orderBy: string,
    isGlobalSearch: boolean
  ) => {
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
          p.isActive = 1
          AND p.isNonPlayer = 0
          ${where}
        )
      ORDER BY ${orderBy}
      LIMIT ${limit}
      OFFSET ${offset}`;
  },

  getPlayersByAdmin: (
    role: PlayerRole,
    where: string,
    offset: number,
    limit: number,
    orderBy: string,
    active: string
  ) => {
    return `
      SELECT p.playerId, p.name, p.mobile, p.state, p.district, p.isSubmitted,
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

  getPlayersForAuction: (
    userId: number,
    where: string,
    offset: number,
    limit: number,
    orderBy: string,
    auctionId: number
  ) => {
    return `SELECT 
        p.playerId, p.name,
        CASE 
            WHEN p.playerId = ${userId} THEN p.mobile
            ELSE CONCAT(
                REPEAT('*', GREATEST(CHAR_LENGTH(p.mobile) - 4, 0)),
                SUBSTRING(p.mobile, -4)
            )
        END AS mobile,
        p.state, p.district,
        EXISTS (
            SELECT 1 
            FROM auction_category_player acp 
            WHERE 
                acp.auctionId = ${auctionId} 
                AND acp.playerId = p.playerId
        ) AS status
      FROM players p
      WHERE
          ${
            where
              ? ""
              : ` p.state = (
            SELECT a.state from auctions a where auctionId = ${auctionId} LIMIT 1
          ) AND `
          }
          p.isApproved = 1 
          AND p.isActive = 1
          ${where}
      ${orderBy ? `ORDER BY ${orderBy}` : ""}
      LIMIT ${limit}
      OFFSET ${offset}`;
  },

  getAddedPlayersForAuction: (userId: number, where: string, offset: number, limit: number, auctionId: number) => {
    return `SELECT 
        p.playerId, p.name,
        CASE 
            WHEN p.playerId = ${userId} THEN p.mobile
            ELSE CONCAT(
                REPEAT('*', GREATEST(CHAR_LENGTH(p.mobile) - 4, 0)),
                SUBSTRING(p.mobile, -4)
            )
        END AS mobile,
        p.state, p.district, acp.baseBid,
        acp.star as isActive,
        acp.isApproved AS status, acp.paymentId as fileId
      FROM auction_category_player acp
      FORCE INDEX (idx_auction_player)
      INNER JOIN players p ON acp.playerId = p.playerId
      WHERE
        acp.auctionId = ${auctionId}
        ${where}
      LIMIT ${limit}
      OFFSET ${offset}`;
  },

  getParticipantPlayersForAuction: (
    userId: number,
    where: string,
    offset: number,
    limit: number,
    auctionId: number
  ) => {
    return `SELECT 
        p.playerId, p.name,
        CASE 
            WHEN p.playerId = ${userId} THEN p.mobile
            ELSE CONCAT(
                REPEAT('*', GREATEST(CHAR_LENGTH(p.mobile) - 4, 0)),
                SUBSTRING(p.mobile, -4)
            )
        END AS mobile,
        p.state, p.district, acp.baseBid,
        acp.star as isActive,
        acp.isApproved AS status
      FROM auction_category_player acp
      FORCE INDEX (idx_auction_player)
      INNER JOIN players p ON acp.playerId = p.playerId
      WHERE
        acp.auctionId = ${auctionId}
        ${where}
      LIMIT ${limit}
      OFFSET ${offset}`;
  },

  getPlayersForCategory: (
    where: string,
    offset: number,
    limit: number,
    auctionId: number
  ) => {
    return `SELECT 
              p.playerId, p.name,
              pi2.battingStyle, 
              pi2.bowlingStyle, 
              pi2.playerRole,
              acp.categoryId
            FROM auction_category_player acp
            FORCE INDEX (idx_auction_player)
            INNER JOIN players p ON acp.playerId = p.playerId
            LEFT JOIN player_informations pi2 ON acp.playerId = pi2.playerId
            WHERE 
              acp.auctionId = ${auctionId}
              ${where}
            LIMIT ${limit}
            OFFSET ${offset}`;
  },

  getParticipantPlayersForCategory: (
    categoryId: number,
    where: string,
    offset: number,
    limit: number,
    auctionId: number
  ) => {
    return `SELECT 
              p.playerId, p.name,
              pi2.battingStyle, 
              pi2.bowlingStyle, 
              pi2.playerRole
            FROM auction_category_player acp
            FORCE INDEX (idx_auction_player)
            INNER JOIN players p ON acp.playerId = p.playerId
            LEFT JOIN player_informations pi2 ON acp.playerId = pi2.playerId
            WHERE 
              acp.auctionId = ${auctionId}
              AND acp.categoryId = ${categoryId}
              ${where}
            LIMIT ${limit}
            OFFSET ${offset}`;
  },

  getParticipantPlayersForTeam: (
    teamId: number,
    where: string,
    offset: number,
    limit: number,
    auctionId: number
  ) => {
    return `SELECT 
                p.playerId,
                p.name AS name,
                pi.battingStyle,
                pi.bowlingStyle,
                pi.playerRole,
                atp.teamId,
                atp.price AS price,
                atp.status AS teamStatus
            FROM auction_team_player atp
            INNER JOIN players p 
                ON p.playerId = atp.playerId
            INNER JOIN player_informations pi 
                ON pi.playerId = p.playerId
            WHERE 
              atp.auctionId = ${auctionId}
              AND atp.teamId = ${teamId}
              ${where}
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
          p.isActive = 1
          AND p.isNonPlayer = 0
          ${where}
        )
      `;
  },

  getCountPlayersByAdmin: (role: PlayerRole, where: string, active: string) => {
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

  getCountPlayersForAuction: (auctionId: number, where: string) => {
    return `
      SELECT  count(*) as total
      FROM players p
      WHERE
          ${
            where
              ? ""
              : ` p.state = (
            SELECT a.state from auctions a where auctionId = ${auctionId} LIMIT 1
          ) AND `
          }
          p.isApproved = 1 
          AND p.isActive = 1
          ${where}
      `;
  },

  getAddedPlayersCountsForAuction: (userId: number, where: string, offset: number, limit: number, auctionId: number) => {
    return `SELECT 
        count(*) as total
      FROM auction_category_player acp
      FORCE INDEX (idx_auction_player)
      INNER JOIN players p ON acp.playerId = p.playerId
      WHERE
        acp.auctionId = ${auctionId}
        ${where}
      LIMIT ${limit}
      OFFSET ${offset}`;
  },

  getCountPlayersForCategory: (auctionId: number, where: string) => {
    return `
      SELECT  count(*) as total
      FROM auction_category_player acp
      FORCE INDEX (idx_auction_player)
      INNER JOIN players p ON acp.playerId = p.playerId
      WHERE 
              acp.auctionId = ${auctionId}
              ${where}
      `;
  },

  getCountPlayersForTeam: (auctionId: number, where: string) => {
    return `
      SELECT count(*) as total
      FROM auction_category_player acp
      INNER JOIN players p 
          ON p.playerId = acp.playerId
      INNER JOIN player_informations pi 
          ON pi.playerId = p.playerId
      LEFT JOIN auction_team_player atp 
          ON atp.auctionId = acp.auctionId 
          AND atp.playerId = acp.playerId
      LEFT JOIN teams t 
          ON t.teamId = atp.teamId 
          AND t.auctionId = acp.auctionId
      WHERE 
        acp.auctionId = ${auctionId}
        ${where}
      `;
  },

  getParticipantPlayersCountForCategory: (auctionId: number, categoryId: number, where: string) => {
    return `
      SELECT  count(*) as total
      FROM auction_category_player acp
      FORCE INDEX (idx_auction_player)
      INNER JOIN players p ON acp.playerId = p.playerId
      WHERE 
              acp.auctionId = ${auctionId}
              AND acp.categoryId = ${categoryId}
              ${where}
      `;
  },

   getParticipantPlayersCountForTeam: (auctionId: number, teamId: number, where: string) => {
    return `
      SELECT  count(*) as total
            FROM auction_team_player atp
      INNER JOIN players p 
          ON p.playerId = atp.playerId
      INNER JOIN player_informations pi 
          ON pi.playerId = p.playerId
      WHERE 
              atp.auctionId = ${auctionId}
              AND atp.teamId = ${teamId}
              ${where}
      `;
  },

  getPlayersForTeam: (
    where: string,
    offset: number,
    limit: number,
    auctionId: number
  ) => {
    return `SELECT 
                p.playerId,
                p.name AS name,
                pi.battingStyle,
                pi.bowlingStyle,
                pi.playerRole,
                t.name AS teamName,
                t.teamId,
                atp.price AS price,
                atp.status AS teamStatus
            FROM auction_category_player acp
            INNER JOIN players p 
                ON p.playerId = acp.playerId
            INNER JOIN player_informations pi 
                ON pi.playerId = p.playerId
            LEFT JOIN auction_team_player atp 
                ON atp.auctionId = acp.auctionId 
                AND atp.playerId = acp.playerId
            LEFT JOIN teams t 
                ON t.teamId = atp.teamId 
                AND t.auctionId = acp.auctionId
            WHERE 
              acp.auctionId = ${auctionId}
              ${where}
            LIMIT ${limit}
            OFFSET ${offset}`;
  },

  getAdmins: (offset: number, limit: number) => {
    return `
      SELECT 
        p.playerId, p.name, p.mobile, p.email,
        1 AS isAdmin
      FROM (
        SELECT playerId
        FROM player_role pr
        JOIN roles r ON pr.roleId = r.roleId
        WHERE r.name = 'ADMIN'
      ) AS admin_ids
      JOIN players p ON admin_ids.playerId = p.playerId
      LIMIT ${limit}
      OFFSET ${offset}`;
  },

  getAdminsCount: () => {
    return `
      SELECT count(*) as total FROM (
        SELECT playerId
        FROM player_role pr
        JOIN roles r ON pr.roleId = r.roleId
        WHERE r.name = 'ADMIN'
      ) AS admin_ids
      JOIN players p ON admin_ids.playerId = p.playerId`;
  },

  getAdminsByWhere: (where: string, offset: number, limit: number) => {
    return `
      SELECT 
        p.playerId, p.name, p.mobile, p.email,
        CASE WHEN EXISTS (
          SELECT 1 
          FROM player_role pr 
          JOIN roles r ON pr.roleId = r.roleId 
          WHERE pr.playerId = p.playerId 
            AND r.name = 'ADMIN'
        ) THEN 1 ELSE 0 END AS isAdmin
      FROM players p
      WHERE p.isActive = True ${where}
      ORDER BY isAdmin DESC
      LIMIT ${limit}
      OFFSET ${offset}`;
  },

  getAdminsCountByWhere: (where: string) => {
    return `
      SELECT count(*) as total
      FROM players p
      WHERE p.isActive = True ${where}`;
  },

  getPlayerDetails: (role: PlayerRole, playerId: number, userId: number) => {
    return `
      SELECT 
        p.playerId, p.name, p.state, p.district,
        pi.jerseyNumber, pi.tShirtSize, pi.lowerSize, pi.hasCricheroesProfile, 
        pi.playerRole, pi.battingStyle, pi.bowlingStyle, pi.description,
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
          AND p.isActive = 1
          ${playerId !== userId ? "AND p.isNonPlayer = 0" : ""}
          `;
  },

  getAdminPlayerDetails: (role: PlayerRole, playerId: number) => {
    return `
    SELECT 
     p.playerId, p.name, p.state, p.district,
        pi.jerseyNumber, pi.tShirtSize, pi.lowerSize, pi.hasCricheroesProfile, 
        pi.playerRole, pi.battingStyle, pi.bowlingStyle, pi.description,
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
                pi.playerRole AS "Player Role",
                pi.battingStyle AS "Batting Style", 
                pi.bowlingStyle AS "Bowling Style", 
                pi.description AS "Player Description",
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

export const publicPlayerQueries = {
  getFileUrl: `select url from files where fileId =?`,
  getPlayersForOwner: `SELECT 
        p.playerId, p.name,
        CASE 
            WHEN p.playerId = ? THEN p.mobile
            ELSE CONCAT(
                REPEAT('*', GREATEST(CHAR_LENGTH(p.mobile) - 4, 0)),
                SUBSTRING(p.mobile, -4)
            )
        END AS mobile,
        p.state, p.district
      FROM players p
      WHERE 
        p.state = (
          SELECT a.state from auctions a where auctionId = ? LIMIT 1
        )
        AND p.isApproved = 1 
        AND p.isActive = 1
        AND NOT EXISTS (
            SELECT 1 FROM team_owner tow
            WHERE tow.teamId = ?
              AND tow.ownerId = p.playerId
        )
      LIMIT 200`,
  getPlayersForOwnerByName: `SELECT 
        p.playerId, p.name,
        CASE 
            WHEN p.playerId = ? THEN p.mobile
            ELSE CONCAT(
                REPEAT('*', GREATEST(CHAR_LENGTH(p.mobile) - 4, 0)),
                SUBSTRING(p.mobile, -4)
            )
        END AS mobile,
        p.state, p.district
      FROM players p
      WHERE p.isApproved = 1 
        AND p.isActive = 1
        AND NOT EXISTS (
            SELECT 1 FROM team_owner tow
            WHERE tow.teamId = ?
              AND tow.ownerId = p.playerId
        )
        AND p.name LIKE CONCAT('%', ?, '%')
      LIMIT 100`,
getAuctionParticipants: `SELECT 
                              p.name as "Player Name",
                              p.mobile as "Mobile Number",
                              p.email as "Email Address",
                              pi.playerRole as "Player Role",
                              pi.battingStyle as "Batting Style",
                              pi.bowlingStyle as "Bowling Style",
                              p.state as "State",
                              p.district as "District",
                              CASE 
                                WHEN p.isApproved THEN 'True'
                                ELSE 'False'
                              END AS "Profile Approved",
                              COALESCE(acp.baseBid, a.baseBid) as "Base Bid"
                          FROM auction_category_player acp
                          FORCE INDEX (idx_auction_player)
                          INNER JOIN players p ON acp.playerId = p.playerId
                          INNER JOIN auctions a ON acp.auctionId = a.auctionId
                          LEFT JOIN player_informations pi ON p.playerId = pi.playerId 
                          WHERE acp.auctionId = ?;`,
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

  private static buildAdminsWhereClause(search: string): string {
    let where = "";
    if (search) {
      where = `AND (p.name LIKE '%${search}%' 
               OR p.email LIKE '%${search}%' 
               OR p.mobile LIKE '%${search}%') `;
    }
    return where;
  }

  private static buildWhereClauseForAuction(search: string): string {
    let where = "";
    if (search) {
      where += ` AND (p.name LIKE '%${search}%' 
               OR p.email LIKE '%${search}%' 
               OR p.mobile LIKE '%${search}%') `;
    }

    return where;
  }

  private static buildWhereClauseForPlayerInAuction(search: string): string {
    let where = "";
    if (search) {
      where += ` AND (p.name LIKE '%${search}%' 
               OR p.email LIKE '%${search}%' 
               OR p.mobile LIKE '%${search}%') `;
    }

    return where;
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
      return queries.getPlayersByAdmin(role, where, offset, limit, orderBy, active);
    }
    return queries.getPlayers(role, userId, where, offset, limit, orderBy, !!search);
  };

  public static getPlayersCount = (
    role: PlayerRole,
    userId: number,
    search: string,
    approved: string,
    active: string
  ) => {
    const where = this.buildWhereClause(search, approved);

    if (RoleHelper.isAdminAndAbove(role)) {
      return queries.getCountPlayersByAdmin(role, where, active);
    }
    return queries.getCountPlayers(userId, where, !!search);
  };

  public static getAdmins = (search: string, offset: number, limit: number) => {
    const where = this.buildAdminsWhereClause(search);
    if (where) {
      return queries.getAdminsByWhere(where, offset, limit);
    }
    return queries.getAdmins(offset, limit);
  };

  public static getAdminsCount = (search: string) => {
    const where = this.buildAdminsWhereClause(search);
    if (where) {
      return queries.getAdminsCountByWhere(where);
    }
    return queries.getAdminsCount();
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

  public static getPlayersForAuction = (
    userId: number,
    search: string,
    offset: number,
    limit: number,
    auctionId: number
  ) => {
    const where = this.buildWhereClauseForAuction(search);
    return queries.getPlayersForAuction(userId, where, offset, limit, "", auctionId);
  };

  public static getPlayersCountForAuction = (auctionId: number, search: string) => {
    const where = this.buildWhereClauseForAuction(search);
    return queries.getCountPlayersForAuction(auctionId, where);
  };

  public static getAddedPlayersForAuction = (
    userId: number,
    search: string,
    offset: number,
    limit: number,
    auctionId: number
  ) => {
    const where = this.buildWhereClauseForPlayerInAuction(search);
    return queries.getAddedPlayersForAuction(userId, where, offset, limit, auctionId);
  };

  public static getAddedPlayersCountForAuction = (
    userId: number,
    search: string,
    offset: number,
    limit: number,
    auctionId: number
  ) => {
    const where = this.buildWhereClauseForPlayerInAuction(search);
    return queries.getAddedPlayersCountsForAuction(userId, where, offset, limit, auctionId);
  };

  public static getPlayersForCategory = (
    search: string,
    offset: number,
    limit: number,
    auctionId: number
  ) => {
    const where = this.buildWhereClauseForAuction(search);
    return queries.getPlayersForCategory(where, offset, limit, auctionId);
  };

  public static getPlayersForTeam = (
    search: string,
    offset: number,
    limit: number,
    auctionId: number
  ) => {
    const where = this.buildWhereClauseForAuction(search);
    return queries.getPlayersForTeam(where, offset, limit, auctionId);
  };

  public static getPlayersCountForCategory = (auctionId: number, search: string) => {
    const where = this.buildWhereClauseForAuction(search);
    return queries.getCountPlayersForCategory(auctionId, where);
  };

  public static getPlayersCountForTeam = (auctionId: number, search: string) => {
    const where = this.buildWhereClauseForAuction(search);
    return queries.getCountPlayersForTeam(auctionId, where);
  };

   public static getParticipantPlayersForCategory = (
    search: string,
    offset: number,
    limit: number,
    auctionId: number,
    categoryId: number
  ) => {
    const where = this.buildWhereClauseForAuction(search);
    return queries.getParticipantPlayersForCategory(categoryId, where, offset, limit, auctionId);
  };

  public static getParticipantPlayersForTeam = (
    search: string,
    offset: number,
    limit: number,
    auctionId: number,
    teamId: number
  ) => {
    const where = this.buildWhereClauseForAuction(search);
    return queries.getParticipantPlayersForTeam(teamId, where, offset, limit, auctionId);
  };

  public static geParticipantPlayersCountForCategory = (auctionId: number, search: string, categoryId: number) => {
    const where = this.buildWhereClauseForAuction(search);
    return queries.getParticipantPlayersCountForCategory(auctionId, categoryId, where);
  };

  public static geParticipantPlayersCountForTeam = (auctionId: number, search: string, teamId: number) => {
    const where = this.buildWhereClauseForAuction(search);
    return queries.getParticipantPlayersCountForTeam(auctionId, teamId, where);
  };
}
