import pool from "../config/db.config";
import { AuthQueries } from "../queries/auth.queries";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { PasswordSchema } from "../types/auth.types";
import { encryptPassword } from "../utils/encryption";

export class AuthService {
  // This will be used before login. Without checking isSubmitted True
  static isValidUser = async (
    playerId: number | null,
    emailOrPhone?: string
  ): Promise<boolean> => {
    try {
      if (playerId) {
        return await this.verifyPlayerById(playerId);
      } else if (emailOrPhone) {
        const result = await this.verifyPlayerByIdentifier(emailOrPhone);
        return result ? true : false;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  private static async verifyPlayerById(playerId: number): Promise<boolean> {
    const [result] = await pool.execute<RowDataPacket[]>(
      AuthQueries.findPlayerCountById,
      [playerId, '1']
    );
    return result?.length > 0 ? result[0].count === 1 : false;
  }

  public static async verifyPlayerByIdentifier(
    identifier: string,
    isSubmitted: boolean = false
  ): Promise<PasswordSchema | null> {

    const query = isSubmitted ? AuthQueries.findSubmittedPlayerByIdentifier : AuthQueries.findPlayerByIdentifier;
    const parameter = isSubmitted ? [identifier, identifier, 1] : [identifier, identifier]; 
    const [result] = await pool.execute<RowDataPacket[]>(
      query,
      parameter
    );
    return result?.length > 0 ? (result[0] as PasswordSchema) : null;
  }

  public static async updatePassword(
    playerId: number,
    password: string
  ): Promise<boolean> {
    const hashedPassword = await encryptPassword(password);
    const [result] = await pool.execute<ResultSetHeader>(
      AuthQueries.updatePassword,
      [hashedPassword, playerId]
    );

    return result.affectedRows > 0;
  }

  static isValidLoggedInUser = async(playerId: number) => {
    const [result] = await pool.execute<RowDataPacket[]>(
      AuthQueries.findLoggedInPlayerCountById,
      [playerId]
    );
    return result?.length > 0 ? result[0].count === 1 : false;
  }
}
