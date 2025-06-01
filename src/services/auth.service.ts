import pool from "../config/db.config";
import { AuthQueries } from "../queries/auth.queries";
import { RowDataPacket } from "mysql2";

export class AuthService {
  static isValidUser = async (
    playerId: number | null,
    emailOrPhone?: string
  ): Promise<boolean> => {
    try {
      if (playerId) {
        return await this.verifyPlayerById(playerId);
      } else if (emailOrPhone) {
        return await this.verifyPlayerByIdentifier(emailOrPhone);
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  private static async verifyPlayerById(playerId: number): Promise<boolean> {
    const [result] = await pool.execute<RowDataPacket[]>(
      AuthQueries.findPlayerById,
      [playerId]
    );
    console.log(result?.length > 0);

    return result?.length > 0 ? result[0].count === 1 : false;
  }

  private static async verifyPlayerByIdentifier(
    identifier: string
  ): Promise<boolean> {
    const [result] = await pool.execute<RowDataPacket[]>(
      AuthQueries.findPlayerByIdentifier,
      [identifier, identifier]
    );
    return result?.length > 0;
  }

}
