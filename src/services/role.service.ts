import pool from "../config/db.config";
import { RowDataPacket } from "mysql2";
import { RoleQueries } from "../queries/role.queries";
import { RolePayload } from "../types";
import { ROLES } from "../constants/roles.constants";

export class RoleService {

  static async getUserRole(playerId: number): Promise<string> {

    const [result] = await pool.execute<RowDataPacket[]>(
      RoleQueries.findPlayerRoleById,
      playerId
    );

    let role: typeof ROLES[keyof typeof ROLES] = ROLES.PLAYER;

    if (result?.length > 0 ) {
      role = (result[0] as RolePayload).name;
    }
    return role;
  }
  
}
