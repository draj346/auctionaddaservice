import pool from "../config/db.config";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { RoleQueries } from "../queries/role.queries";
import { RolePayload } from "../types";
import { ROLES } from "../constants/roles.constants";
import { RegistrationQueries } from "../queries/registration.queries";
import { PlayerQueries } from "../queries/player.queries";

export class RoleService {

  static async getUserRole(playerId: number): Promise<string> {
    const [result] = await pool.execute<RowDataPacket[]>(
      RoleQueries.findPlayerRoleById,
      [playerId]
    );

    let role: typeof ROLES[keyof typeof ROLES] = ROLES.PLAYER;

    if (result?.length > 0 ) {
      role = (result[0] as RolePayload).name;
    }
    return role;
  }

  async createAdmin(playerId: number): Promise<boolean> {
    const [adminRoles] = await pool.execute<RowDataPacket[]>(
      RoleQueries.getAdminRole
    );

    if (adminRoles.length === 0) {
      return false;
    }

    const adminRoleId = adminRoles[0].roleId;

    const [result1] = await pool.execute<ResultSetHeader>(RoleQueries.setRole, [
      playerId,
      adminRoleId,
    ]);

    const [result] = await pool.execute<ResultSetHeader>(RoleQueries.updatePlayerForAdmin, [
      playerId
    ]);

    return result.affectedRows > 0;
  }

  async deleteRole(playerId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(RoleQueries.deleteRole, [
      playerId,
    ]);

    return result.affectedRows > 0;
  }

  async approvePlayers(playerIds: number[]): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(PlayerQueries.approvePlayer(playerIds));

    return result.affectedRows > 0;
  }
  
}
