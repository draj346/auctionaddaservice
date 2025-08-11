import { RowDataPacket } from "mysql2";
import pool from "../config/db.config";
import { IBanner, IDiscount, IYoutube } from "../types";
import { CommonQueries } from "../queries/common.queries";

export class CommonService {
  public static async getBanner(): Promise<IBanner[] | null> {
    const [result] = await pool.execute<RowDataPacket[]>(CommonQueries.getBanner);
    return result?.length > 0 ? (result as IBanner[]) : null;
  }

  public static async getDiscount(): Promise<IDiscount[] | null> {
    const [result] = await pool.execute<RowDataPacket[]>(CommonQueries.getDiscount);
    return result?.length > 0 ? (result as IDiscount[]) : null;
  }

  public static async getYoutubes(): Promise<IYoutube[] | null> {
    const [result] = await pool.execute<RowDataPacket[]>(CommonQueries.getVideos);
    return result?.length > 0 ? (result as IYoutube[]) : null;
  }
}
