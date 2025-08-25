import { PlayerRole, ROLES } from "../constants/roles.constants";

export class RoleHelper {
  static isOrganiserAndOwner(role: PlayerRole) {
    return ([ROLES.ORGANISER, ROLES.OWNER] as PlayerRole[]).includes(role);
  }

  static isOrganiser(role: PlayerRole) {
    return ROLES.ORGANISER === role;
  }

  static isSuperAdmin(role: PlayerRole) {
    return ROLES.SUPER_ADMIN === role;
  }

  static isAdmin(role: PlayerRole) {
    return ROLES.ADMIN === role;
  }

  static isAdminAndAbove(role: PlayerRole) {
    return ([ROLES.ADMIN, ROLES.SUPER_ADMIN] as PlayerRole[]).includes(role);
  }

  static isOrganiserAndAbove(role: PlayerRole) {
    return ([ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.ORGANISER] as PlayerRole[]).includes(role);
  }

  static isOwnerOrBelow(role: PlayerRole) {
    return ([ROLES.OWNER, ROLES.PLAYER] as PlayerRole[]).includes(role);
  }

  static isPlayer(role: PlayerRole) {
    return ([ROLES.PLAYER] as PlayerRole[]).includes(role);
  }

  static isOwner(role: PlayerRole) {
    return ([ROLES.OWNER] as PlayerRole[]).includes(role);
  }
}
