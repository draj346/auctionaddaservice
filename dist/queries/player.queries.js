"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerQueries = void 0;
const roles_helpers_1 = require("../helpers/roles.helpers");
const queries = {
    getPlayers: (role, userId, where, offset, limit, orderBy) => {
        return `SELECT 
        p.playerId, p.name, p.mobile, p.email
        ${roles_helpers_1.RoleHelper.isOrganiserAndOwner(role) ? ", p.pricePerMatch" : ""}
        ${roles_helpers_1.RoleHelper.isOrganiser(role) ? ", p.willJoinAnyOwner" : ""},
        ${roles_helpers_1.RoleHelper.isOrganiser(role)
            ? "1 as status"
            : `(p.playerId = ${userId}) AS status`}
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
    getAdminPlayers: (role, isActive, userId, where, offset, limit, orderBy) => {
        return `
      SELECT p.playerId, p.name, p.mobile, p.email, p.pricePerMatch, p.willJoinAnyOwner,
             p.isApproved, p.isNonPlayer, 1 as status
      FROM players p
      WHERE p.isActive = ${isActive ? 1 : 0}
        ${roles_helpers_1.RoleHelper.isSuperAdmin(role)
            ? ""
            : `AND NOT EXISTS (
                SELECT 1 
                FROM player_role pr 
                JOIN roles r ON pr.roleId = r.roleId
                WHERE pr.playerId = p.playerId 
                  AND r.name = 'SUPER_ADMIN'
              )`} ${where}
      ORDER BY ${orderBy}
      LIMIT ${limit}
      OFFSET ${offset}`;
    },
    getCountPlayers: (userId, where) => {
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
    getCountAdminPlayers: (role, isActive, where) => {
        return `
      SELECT  count(*) as total
      FROM players p
      WHERE p.isActive = ${isActive ? 1 : 0}
        ${roles_helpers_1.RoleHelper.isSuperAdmin(role)
            ? ""
            : `AND NOT EXISTS (
                SELECT 1 
                FROM player_role pr 
                JOIN roles r ON pr.roleId = r.roleId
                WHERE pr.playerId = p.playerId 
                  AND r.name = 'SUPER_ADMIN'
              )`} ${where}
      `;
    },
    getPlayerDetails: (role, playerId) => {
        return `
      SELECT 
        p.playerId, p.name, p.mobile, p.email, 
        p.jerseyNumber, p.tShirtSize, p.lowerSize, 
        p.hasCricheroesProfile, url
        ${roles_helpers_1.RoleHelper.isOrganiserAndOwner(role) ? ", p.pricePerMatch" : ""}
        ${roles_helpers_1.RoleHelper.isOrganiser(role) ? ", p.willJoinAnyOwner" : ""}
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
    getAdminPlayerDetails: (role, playerId) => {
        return `
      SELECT 
        p.playerId, p.name, p.mobile, p.email, p.jerseyNumber, 
        p.tShirtSize, p.lowerSize, p.hasCricheroesProfile,
        p.pricePerMatch, p.willJoinAnyOwner, p.isApproved, 
        p.isNonPlayer, url
      FROM players p 
      LEFT JOIN files f ON p.image = f.fileId
      WHERE p.playerId = ${playerId}
        ${roles_helpers_1.RoleHelper.isSuperAdmin(role)
            ? ""
            : `AND NOT EXISTS (
          SELECT 1 
          FROM player_role pr 
          JOIN roles r ON pr.roleId = r.roleId
          WHERE pr.playerId = p.playerId 
            AND r.name = 'SUPER_ADMIN'
        )`}`;
    },
    approvePlayer: (ids) => {
        return `update players set isApproved = 1 where playerId IN (${ids})`;
    },
    getPlayersForExport: (ids) => {
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
class PlayerQueries {
    static buildWhereClause(search, owner, approved) {
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
    static buildOrderByClause(sort, userId) {
        const defaultSort = `CASE WHEN p.playerId = ${userId} THEN 0 ELSE 1 END, p.playerId ASC`;
        if (!sort)
            return defaultSort;
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
}
exports.PlayerQueries = PlayerQueries;
_a = PlayerQueries;
PlayerQueries.getPlayers = (role, isActive, userId, search, owner, approved, offset, limit, sort) => {
    const where = _a.buildWhereClause(search, owner, approved);
    const orderBy = _a.buildOrderByClause(sort || '', userId);
    if (roles_helpers_1.RoleHelper.isAdminAndAbove(role)) {
        const query = queries.getAdminPlayers(role, isActive, userId, where, offset, limit, orderBy);
        return query;
    }
    const query = queries.getPlayers(role, userId, where, offset, limit, orderBy);
    return query;
};
PlayerQueries.getPlayersCount = (role, isActive, userId, search, owner, approved) => {
    const where = _a.buildWhereClause(search, owner, approved);
    if (roles_helpers_1.RoleHelper.isAdminAndAbove(role)) {
        return queries.getCountAdminPlayers(role, isActive, where);
    }
    return queries.getCountPlayers(userId, where);
};
PlayerQueries.getPlayerById = (role, playerId) => {
    if (roles_helpers_1.RoleHelper.isAdminAndAbove(role)) {
        return queries.getAdminPlayerDetails(role, playerId);
    }
    return queries.getPlayerDetails(role, playerId);
};
PlayerQueries.approvePlayer = (playerIds) => {
    return queries.approvePlayer(playerIds.join());
};
PlayerQueries.getPlayerForExport = (playerIds) => {
    return queries.getPlayersForExport(playerIds.join());
};
