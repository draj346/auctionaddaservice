import pool from "../config/db.config";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { RoleQueries } from "../queries/role.queries";
import { RolePayload } from "../types";
import { PlayerRole, ROLES } from "../constants/roles.constants";
import { PlayerQueries } from "../queries/player.queries";
import { RoleHelper } from "../helpers/roles.helpers";

export class RoleService {
  static async getUserRole(playerId: number): Promise<string> {
    const [result] = await pool.execute<RowDataPacket[]>(
      RoleQueries.findPlayerRoleById,
      [playerId]
    );

    let role: (typeof ROLES)[keyof typeof ROLES] = ROLES.PLAYER;

    if (result?.length > 0) {
      role = (result[0] as RolePayload).name;
    }
    return role;
  }

  async createAdmin(playerId: number): Promise<boolean> {
    const [adminRoles] = await pool.execute<RowDataPacket[]>(
      RoleQueries.getRoleIdByName,
      ['ADMIN']
    );

    if (adminRoles.length === 0) {
      return false;
    }

    const adminRoleId = adminRoles[0].roleId;

    await this.deleteRole(playerId);

    const [adminResult] = await pool.execute<ResultSetHeader>(RoleQueries.setRole, [
      playerId,
      adminRoleId,
    ]);

    if (adminResult.affectedRows > 0 ) {
      await this.approvePlayers([playerId]);
    }

    return adminResult.affectedRows > 0;
  }

  async deleteRole(playerId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      RoleQueries.deleteRole,
      [playerId]
    );

    return result.affectedRows > 0;
  }

  async approvePlayers(playerIds: number[]): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      PlayerQueries.approvePlayer(playerIds)
    );

    return result.affectedRows > 0;
  }

  private static hasRoleAccess(
    userRole: PlayerRole,
    accessRole: PlayerRole
  ): boolean {
    if (RoleHelper.isSuperAdmin(userRole)) {
      return true;
    }

    if (RoleHelper.isAdmin(userRole)) {
      return !RoleHelper.isSuperAdmin(accessRole);
    }

    if (RoleHelper.isOrganiser(userRole)) {
      return !RoleHelper.isAdminAndAbove(accessRole);
    }

    return userRole === accessRole;
  }

  static async hasAccess(
    userRole: PlayerRole,
    playerId: number,
    accessPlayerId: number
  ): Promise<boolean> {
    const accessRole = (await this.getUserRole(accessPlayerId)) as PlayerRole;
    const hasRoleAccess = this.hasRoleAccess(userRole, accessRole);

    return (
      hasRoleAccess &&
      (accessRole !== userRole || playerId * 1 === accessPlayerId * 1)
    );
  }

  static async hasSameLevelAccess(
    userRole: PlayerRole,
    accessPlayerId: number
  ): Promise<boolean> {
    const accessRole = (await this.getUserRole(accessPlayerId)) as PlayerRole;
    if (accessRole === userRole) {
      return true;
    }
    return !this.hasRoleAccess(userRole, accessRole);
  }

  static async hasRoleAccessOnly(
    userRole: PlayerRole,
    accessPlayerId: number
  ): Promise<boolean> {
    const accessRole = (await this.getUserRole(accessPlayerId)) as PlayerRole;
    return this.hasRoleAccess(userRole, accessRole);
  }

  static async isSelfOrAdminOrAbove(
    userRole: PlayerRole,
    playerId: number,
    accessPlayerId: number,
    self = true
  ): Promise<boolean> {
    const accessRole = (await this.getUserRole(accessPlayerId)) as PlayerRole;
    
    if (RoleHelper.isSuperAdmin(userRole)) {
      return true;
    }

    if (RoleHelper.isAdmin(userRole)) {
      return !RoleHelper.isSuperAdmin(accessRole);
    }

    return self && playerId * 1 === accessPlayerId * 1;
  }

  static async isAdminOrAboveForDelete(
    userRole: PlayerRole,
    accessPlayerId: number,
  ): Promise<boolean> {
    const accessRole = (await this.getUserRole(accessPlayerId)) as PlayerRole;
    
    if (RoleHelper.isSuperAdmin(userRole)) {
      return true;
    }

    if (RoleHelper.isAdmin(userRole)) {
      return !RoleHelper.isAdminAndAbove(accessRole);
    }

    return false;
  }
  
}
