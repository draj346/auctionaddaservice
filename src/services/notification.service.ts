import pool from "../config/db.config";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import {
  NOTIFICATION_TYPE_MESSAGE,
  NOTIFICATIONS,
  NotificationType,
  PENDING_UPDATES_STATUS,
  PendingUpdateStatusType,
} from "../constants/notification.constants";
import { NotificationQueries, NotificationQueriesFn } from "../queries/notification.queries";
import { INotification, INotificationCount, IPendingUpdate } from "../types/notification.types";

export class NotificationService {
  // Notifications
  static async createNotification(
    playerId: number,
    message: string,
    type: NotificationType,
    submittedBy: number
  ): Promise<boolean> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(NotificationQueries.createNotification, [
        playerId,
        message,
        type,
        submittedBy,
      ]);

      return result.affectedRows > 0;
    } catch (error) {
      console.error("notification creation failed:", error);
      return false;
    }
  }

  static async batchCreateNotification(
    playerIds: number[],
    message: string,
    type: NotificationType,
    submittedBy: number
  ): Promise<boolean> {
    if (playerIds.length === 0) return true;

    const placeholders: string[] = [];
    const values: any[] = [];

    playerIds.forEach((playerId) => {
      placeholders.push("(?, ?, ?, ?)");
      values.push(playerId, message, type, submittedBy);
    });

    try {
      await pool.execute<ResultSetHeader>(NotificationQueriesFn.batchCreateNotification(placeholders.join(", ")));
      return true;
    } catch (error) {
      console.error("Batch notification creation failed:", error);
      return false;
    }
  }

  static async getUserNotifications(playerId: number): Promise<INotification[]> {
    const [result] = await pool.execute<RowDataPacket[]>(NotificationQueries.getNotifications, [playerId]);

    return result.length > 0 ? (result[0] as INotification[]) : [];
  }

  static async getNewNotificationsCount(playerId: number): Promise<INotificationCount> {
    const [notification] = await pool.execute<RowDataPacket[]>(NotificationQueries.getNewNotificationsCount, [
      playerId,
    ]);
    const [pendingUpdate] = await pool.execute<RowDataPacket[]>(NotificationQueries.getPendingUpdateCount, [playerId]);

    let count = 0,
      pending = 0;
    if (notification.length > 0) {
      count = notification[0].total;
    }

    if (pendingUpdate.length > 0) {
      pending = pendingUpdate[0].total;
      count += pending;
    }

    return { pending, total: count };
  }

  static async updateIsRead(playerId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(NotificationQueries.updateIsRead, [true, playerId]);

    return result.affectedRows > 0;
  }

  // Pending Updates
  static async createPendingUpdate(
    playerId: number,
    submittedBy: number,
    updatedData: JSON,
    message: string
  ): Promise<boolean> {
    const status = PENDING_UPDATES_STATUS.PENDING as PendingUpdateStatusType;
    const [result] = await pool.execute<ResultSetHeader>(NotificationQueries.createPendingUpdate, [
      playerId,
      submittedBy,
      updatedData,
      status,
      message,
    ]);

    return result.affectedRows > 0;
  }

  static async getPendingUpdates(playerId: number): Promise<IPendingUpdate[]> {
    const [result] = await pool.execute<RowDataPacket[]>(NotificationQueries.getPendingUpdate, [playerId]);
    return result.length > 0 ? (result[0] as IPendingUpdate[]) : [];
  }

  static async actionPendingUpdate(
    id: number,
    status: PendingUpdateStatusType,
    playerId: number,
    submittedBy: number | null
  ): Promise<boolean> {
    await pool.execute(NotificationQueries.updatePendingStatus, [status, id]);

    const [result] = await pool.execute<RowDataPacket[]>(NotificationQueries.pendingUpdate, [id]);

    const notifType =
      status === PENDING_UPDATES_STATUS.APPROVED ? NOTIFICATIONS.UPDATE_APPROVED : NOTIFICATIONS.UPDATE_REJECTED;

    const message =
      status === PENDING_UPDATES_STATUS.APPROVED
        ? `You have successfully approved the request for ${NOTIFICATION_TYPE_MESSAGE[notifType]}`
        : `YOu have rejected the request to update ${NOTIFICATION_TYPE_MESSAGE[notifType]}`;

    await this.createNotification(
      playerId,
      message,
      notifType as NotificationType,
      submittedBy ? submittedBy : playerId
    );

    return true;
  }
}
