import pool from "../config/db.config";
import { AuthQueries, GuestAuthQueries } from "../queries/auth.queries";
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
        return await this.verifyPlayerByIdentifier(emailOrPhone);
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  private static async verifyPlayerById(playerId: number): Promise<boolean> {
    const [result] = await pool.execute<RowDataPacket[]>(
      GuestAuthQueries.findPlayerCountById,
      [playerId]
    );
    return result?.length > 0 ? result[0].count === 1 : false;
  }

   private static async verifyPlayerByIdentifier(identifier: string): Promise<boolean> {
    const [result] = await pool.execute<RowDataPacket[]>(
      GuestAuthQueries.findPlayerCountByIdentifier,
      [identifier, identifier]
    );
    return result?.length > 0 ? result[0].count === 1 : false;
  }

  public static async getPlayerIdByIdentifier(identifier: string): Promise<number | null> {
    const [result] = await pool.execute<RowDataPacket[]>(
      GuestAuthQueries.findPlayerIdByIdentifier,
      [identifier, identifier]
    );

    return result?.length > 0 ? result[0].playerId: null;
  }

  public static async getPlayerImageByPlayerId(playerId: number): Promise<string | null> {
    const [result] = await pool.execute<RowDataPacket[]>(
      GuestAuthQueries.getImageByIdentifier,
      [playerId]
    );

    return result?.length > 0 ? result[0].url : null;
  }

  public static async getPasswordByPlayerId(playerId: number): Promise<PasswordSchema | null> {
    const [result] = await pool.execute<RowDataPacket[]>(
      GuestAuthQueries.getPassword,
      [playerId]
    );

    return result?.length > 0 ? (result[0] as PasswordSchema) : null;
  }

  public static async updatePassword(
    playerId: number,
    password: string
  ): Promise<boolean> {
    const hashedPassword = await encryptPassword(password);
    const [result] = await pool.execute<ResultSetHeader>(
      GuestAuthQueries.updatePassword,
      [playerId, hashedPassword]
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
