"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleService = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
const role_queries_1 = require("../queries/role.queries");
const roles_constants_1 = require("../constants/roles.constants");
const player_queries_1 = require("../queries/player.queries");
const roles_helpers_1 = require("../helpers/roles.helpers");
class RoleService {
    static async getUserRole(playerId) {
        const [result] = await db_config_1.default.execute(role_queries_1.RoleQueries.findPlayerRoleById, [playerId]);
        let role = roles_constants_1.ROLES.PLAYER;
        if (result?.length > 0) {
            role = result[0].name;
        }
        return role;
    }
    static async createAdmin(playerId) {
        const adminResult = await this.createRole(playerId, roles_constants_1.ROLES.ADMIN);
        if (adminResult) {
            await this.approvePlayers([playerId]);
        }
        return adminResult;
    }
    static async createRole(playerId, roleName) {
        const [result] = await db_config_1.default.execute(role_queries_1.RoleQueries.getRoleIdByName, [roleName]);
        if (result.length === 0) {
            return false;
        }
        const roleId = result[0].roleId;
        await this.deleteRole(playerId);
        const [userRoleResult] = await db_config_1.default.execute(role_queries_1.RoleQueries.setRole, [
            playerId,
            roleId,
        ]);
        return userRoleResult.affectedRows > 0;
    }
    static async createOrganiser(playerId) {
        const result = await this.createRole(playerId, roles_constants_1.ROLES.ORGANISER);
        return result;
    }
    static async createOwner(playerId) {
        const result = await this.createRole(playerId, roles_constants_1.ROLES.OWNER);
        return result;
    }
    static async deleteRole(playerId) {
        const [result] = await db_config_1.default.execute(role_queries_1.RoleQueries.deleteRole, [playerId]);
        return result.affectedRows > 0;
    }
    static async approvePlayers(playerIds) {
        const [result] = await db_config_1.default.execute(player_queries_1.PlayerQueries.approvePlayer(playerIds));
        return result.affectedRows > 0;
    }
    static hasRoleAccess(userRole, accessRole) {
        if (roles_helpers_1.RoleHelper.isSuperAdmin(userRole)) {
            return true;
        }
        if (roles_helpers_1.RoleHelper.isAdmin(userRole)) {
            return !roles_helpers_1.RoleHelper.isSuperAdmin(accessRole);
        }
        if (roles_helpers_1.RoleHelper.isOrganiser(userRole)) {
            return !roles_helpers_1.RoleHelper.isAdminAndAbove(accessRole);
        }
        return userRole === accessRole;
    }
    static async hasAccess(userRole, playerId, accessPlayerId) {
        const accessRole = (await this.getUserRole(accessPlayerId));
        const hasRoleAccess = this.hasRoleAccess(userRole, accessRole);
        return (hasRoleAccess &&
            (accessRole !== userRole || playerId * 1 === accessPlayerId * 1));
    }
    static async hasSameLevelAccess(userRole, accessPlayerId) {
        const accessRole = (await this.getUserRole(accessPlayerId));
        if (accessRole === userRole) {
            return true;
        }
        return !this.hasRoleAccess(userRole, accessRole);
    }
    static async hasRoleAccessOnly(userRole, accessPlayerId) {
        const accessRole = (await this.getUserRole(accessPlayerId));
        return this.hasRoleAccess(userRole, accessRole);
    }
    static async isSelfOrAdminOrAbove(userRole, playerId, accessPlayerId, self = true) {
        const accessRole = (await this.getUserRole(accessPlayerId));
        if (roles_helpers_1.RoleHelper.isSuperAdmin(userRole)) {
            return true;
        }
        if (roles_helpers_1.RoleHelper.isAdmin(userRole)) {
            return !roles_helpers_1.RoleHelper.isSuperAdmin(accessRole);
        }
        return self && playerId * 1 === accessPlayerId * 1;
    }
    static async isAdminOrAboveForDelete(userRole, accessPlayerId) {
        const accessRole = (await this.getUserRole(accessPlayerId));
        if (roles_helpers_1.RoleHelper.isSuperAdmin(userRole)) {
            return true;
        }
        if (roles_helpers_1.RoleHelper.isAdmin(userRole)) {
            return !roles_helpers_1.RoleHelper.isAdminAndAbove(accessRole);
        }
        return false;
    }
}
exports.RoleService = RoleService;
