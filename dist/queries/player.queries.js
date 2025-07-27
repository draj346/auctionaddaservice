"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerQueries = exports.publicPlayerQueries = void 0;
const roles_helpers_1 = require("../helpers/roles.helpers");
const queries = {
    getPlayers: (role, userId, where, offset, limit, orderBy, isGlobalSearch) => {
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
      ${isGlobalSearch
            ? ""
            : `JOIN (SELECT district 
                    FROM players 
                    WHERE playerId = ${userId}
                  ) user_district ON p.district = user_district.district`}
      WHERE 
        ${where ? "" : `p.playerId = ${userId} OR`}
        (
          p.isApproved = 1 
          AND p.isActive = 1
          AND p.isNonPlayer = 0
          ${where}
        )
      ORDER BY ${orderBy}
      LIMIT ${limit}
      OFFSET ${offset}`;
    },
    getPlayersByAdmin: (role, where, offset, limit, orderBy, active) => {
        return `
      SELECT p.playerId, p.name, p.mobile, p.state, p.district,
             p.isApproved, p.isVerified, p.isNonPlayer, p.isActive, 1 as status
      FROM players p
        WHERE 1=1
        ${active !== "all" ? ` AND p.isActive = ${active === "Yes" ? 1 : 0}` : ""}
        ${roles_helpers_1.RoleHelper.isSuperAdmin(role)
            ? ""
            : ` AND NOT EXISTS (
                SELECT 1 
                FROM player_role pr 
                JOIN roles r ON pr.roleId = r.roleId
                WHERE pr.playerId = p.playerId 
                  AND r.name IN ('SUPER_ADMIN', 'ADMIN')
              )`} ${where}
      ORDER BY ${orderBy}
      LIMIT ${limit}
      OFFSET ${offset}`;
    },
    getCountPlayers: (userId, where, isGlobalSearch) => {
        return `SELECT count(*) as total
      FROM players p
      ${isGlobalSearch
            ? ""
            : `JOIN (SELECT district 
                    FROM players 
                    WHERE playerId = ${userId}
                  ) user_district ON p.district = user_district.district`}
      WHERE 
        ${where ? "" : `p.playerId = ${userId} OR`}
        (
          p.isApproved = 1 
          AND p.isActive = 1
          AND p.isNonPlayer = 0
          ${where}
        )
      `;
    },
    getCountPlayersByAdmin: (role, where, active) => {
        return `
      SELECT  count(*) as total
      FROM players p
      WHERE 1=1
        ${active !== "all" ? ` AND p.isActive = ${active === "Yes" ? 1 : 0}` : ""}
        ${roles_helpers_1.RoleHelper.isSuperAdmin(role)
            ? ""
            : ` AND NOT EXISTS (
                SELECT 1 
                FROM player_role pr 
                JOIN roles r ON pr.roleId = r.roleId
                WHERE pr.playerId = p.playerId 
                  AND r.name IN ('SUPER_ADMIN', 'ADMIN')
              )`} ${where}
      `;
    },
    getAdmins: (offset, limit) => {
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
    getAdminsByWhere: (where, offset, limit) => {
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
    getAdminsCountByWhere: (where) => {
        return `
      SELECT count(*) as total
      FROM players p
      WHERE p.isActive = True ${where}`;
    },
    getPlayerDetails: (role, playerId, userId) => {
        return `
      SELECT 
        p.playerId, p.name, p.state, p.district,
        pi.jerseyNumber, pi.tShirtSize, pi.lowerSize, pi.hasCricheroesProfile, 
        pi.isPaidPlayer, p.isVerified,
        p.isApproved, p.isNonPlayer,
        f.url AS image, f.fileId, (p.playerId = ${userId}) AS status
        ${playerId === userId
            ? ", p.mobile, p.email, pi.pricePerMatch, pi.willJoinAnyOwner"
            : (roles_helpers_1.RoleHelper.isOrganiserAndOwner(role) ? ", pi.pricePerMatch" : "") +
                (roles_helpers_1.RoleHelper.isOrganiser(role) && playerId !== userId ? ", pi.willJoinAnyOwner" : "")}
      FROM players p
      LEFT JOIN player_informations pi 
          ON p.playerId = pi.playerId
      LEFT JOIN player_images pimg 
          ON p.playerId = pimg.playerId
      LEFT JOIN files f 
        ON pimg.imageId = f.fileId
      WHERE 
        p.playerId = ${playerId} 
          AND p.isApproved = 1 
          AND p.isActive = 1
          ${playerId !== userId ? "AND p.isNonPlayer = 0" : ""}
          `;
    },
    getAdminPlayerDetails: (role, playerId) => {
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
      ${roles_helpers_1.RoleHelper.isSuperAdmin(role)
            ? ""
            : `AND NOT EXISTS (
                SELECT 1 
                FROM player_role pr 
                JOIN roles r ON pr.roleId = r.roleId
                WHERE pr.playerId = p.playerId 
                  AND r.name IN ('SUPER_ADMIN', 'ADMIN')
              )`}`;
    },
    approvePlayer: (ids) => {
        return `update players set isApproved = 1 where playerId IN (${ids})`;
    },
    getPlayersForExport: (role, ids) => {
        let query = `SELECT 
                p.name AS "Full Name",
                 ${roles_helpers_1.RoleHelper.isSuperAdmin(role)
            ? `
                    mobile AS "Mobile",
                    email AS "Email",
                  `
            : ""}
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
exports.publicPlayerQueries = {
    getFileUrl: `select url from files where fileId =?`
};
class PlayerQueries {
    static buildWhereClause(search, approved) {
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
    static buildOrderByClause(sort, userId) {
        const defaultSort = `CASE WHEN p.playerId = ${userId} THEN 0 ELSE 1 END, p.playerId ASC`;
        if (!sort)
            return defaultSort;
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
    static buildAdminsWhereClause(search) {
        let where = "";
        if (search) {
            where = `AND (p.name LIKE '%${search}%' 
               OR p.email LIKE '%${search}%' 
               OR p.mobile LIKE '%${search}%') `;
        }
        return where;
    }
}
exports.PlayerQueries = PlayerQueries;
_a = PlayerQueries;
PlayerQueries.getPlayers = (role, userId, search, approved, offset, limit, sort, active) => {
    const where = _a.buildWhereClause(search, approved);
    const orderBy = _a.buildOrderByClause(sort || "", userId);
    if (roles_helpers_1.RoleHelper.isAdminAndAbove(role)) {
        return queries.getPlayersByAdmin(role, where, offset, limit, orderBy, active);
    }
    return queries.getPlayers(role, userId, where, offset, limit, orderBy, !!search);
};
PlayerQueries.getPlayersCount = (role, userId, search, approved, active) => {
    const where = _a.buildWhereClause(search, approved);
    if (roles_helpers_1.RoleHelper.isAdminAndAbove(role)) {
        return queries.getCountPlayersByAdmin(role, where, active);
    }
    return queries.getCountPlayers(userId, where, !!search);
};
PlayerQueries.getAdmins = (search, offset, limit) => {
    const where = _a.buildAdminsWhereClause(search);
    if (where) {
        return queries.getAdminsByWhere(where, offset, limit);
    }
    return queries.getAdmins(offset, limit);
};
PlayerQueries.getAdminsCount = (search) => {
    const where = _a.buildAdminsWhereClause(search);
    if (where) {
        return queries.getAdminsCountByWhere(where);
    }
    return queries.getAdminsCount();
};
PlayerQueries.getPlayerById = (role, playerId, isActive, userId) => {
    if (roles_helpers_1.RoleHelper.isAdminAndAbove(role)) {
        return queries.getAdminPlayerDetails(role, playerId);
    }
    return queries.getPlayerDetails(role, playerId, userId);
};
PlayerQueries.approvePlayer = (playerIds) => {
    return queries.approvePlayer(playerIds.join());
};
PlayerQueries.getPlayerForExport = (role, playerIds) => {
    return queries.getPlayersForExport(role, playerIds.join());
};
