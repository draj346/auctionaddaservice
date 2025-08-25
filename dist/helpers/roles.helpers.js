"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleHelper = void 0;
const roles_constants_1 = require("../constants/roles.constants");
class RoleHelper {
    static isOrganiserAndOwner(role) {
        return [roles_constants_1.ROLES.ORGANISER, roles_constants_1.ROLES.OWNER].includes(role);
    }
    static isOrganiser(role) {
        return roles_constants_1.ROLES.ORGANISER === role;
    }
    static isSuperAdmin(role) {
        return roles_constants_1.ROLES.SUPER_ADMIN === role;
    }
    static isAdmin(role) {
        return roles_constants_1.ROLES.ADMIN === role;
    }
    static isAdminAndAbove(role) {
        return [roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.SUPER_ADMIN].includes(role);
    }
    static isOrganiserAndAbove(role) {
        return [roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.SUPER_ADMIN, roles_constants_1.ROLES.ORGANISER].includes(role);
    }
    static isOwnerOrBelow(role) {
        return [roles_constants_1.ROLES.OWNER, roles_constants_1.ROLES.PLAYER].includes(role);
    }
    static isPlayer(role) {
        return [roles_constants_1.ROLES.PLAYER].includes(role);
    }
    static isOwner(role) {
        return [roles_constants_1.ROLES.OWNER].includes(role);
    }
}
exports.RoleHelper = RoleHelper;
