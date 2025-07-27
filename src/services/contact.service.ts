import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db.config";
import { ContactQueries } from "../queries/contact.queries";
import { IContactMessageDetails, ICreateContactMessage, IUpdateContactMessage } from "../types/contact.types";

export class ContactService {
  public static async insertComment(contact: ICreateContactMessage): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(ContactQueries.insertContactMessage, [
      contact.name,
      contact.mobile,
      contact.email,
      contact.subject,
      contact.message,
    ]);

    return result.affectedRows > 0;
  }

  public static async updateWorkStatus(contact: IUpdateContactMessage): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(ContactQueries.updateWorkStatus, [
      true,
      contact.playerId,
      contact.id,
    ]);

    return result.affectedRows > 0;
  }

  public static async getUnWorkComment(): Promise<IContactMessageDetails[] | null> {
    const [result] = await pool.execute<RowDataPacket[]>(ContactQueries.getUnWorkMessage);
    return result?.length > 0 ? (result as IContactMessageDetails[]) : null;
  }

  public static async getWorkComment(): Promise<IContactMessageDetails[] | null> {
    const [result] = await pool.execute<RowDataPacket[]>(ContactQueries.getWorkMessage);
    return result?.length > 0 ? (result as IContactMessageDetails[]) : null;
  }
}
