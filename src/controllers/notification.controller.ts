import { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse";
import { NotificationService } from "../services/notification.service";
import { IUpdatePendingUpdate } from "../types/notification.types";
import { PENDING_UPDATES_STATUS, PendingUpdateStatusType } from "../constants/notification.constants";


export class NotificationController {
  static getMyNotification = async (req: Request, res: Response) => {
    try {
      const notifications = await NotificationService.getUserNotifications(req.userId);
      const pendingActions = await NotificationService.getPendingUpdates(req.userId);
      const count = await NotificationService.getNewNotificationsCount(req.userId);
      const response = {
        Notifications: notifications,
        PendingActions: pendingActions,
        Total: count.total
      }
       ApiResponse.success(res, response, 200, "Notification List");
    } catch (error) {
      console.log(error);
      ApiResponse.error(
        res,
        "Something went happen. Please try again.",
        500,
        {isError: false}
      );
    }
  };

  static getNewNotificationCount = async (req: Request, res: Response) => {
    try {
      const total = await NotificationService.getNewNotificationsCount(req.userId);
       ApiResponse.success(res, total, 200, "You Have new Notification");
    } catch (error) {
      console.log(error);
      ApiResponse.error(
        res,
        "Something went happen. Please try again.",
        500,
        {isError: false}
      );
    }
  };

  static updateIsRead = async (req: Request, res: Response) => {
    try {
      const count = await NotificationService.updateIsRead(req.userId);
       ApiResponse.success(res, {}, 200, "Notification Read Successfully!!");
    } catch (error) {
      console.log(error);
      ApiResponse.error(
        res,
        "Something went happen. Please try again.",
        500,
        {isError: false}
      );
    }
  };

  static updatePendingAction = async (req: Request, res: Response) => {
    try {
      const payload = req.body as IUpdatePendingUpdate;
      const status = payload.status ? PENDING_UPDATES_STATUS.APPROVED : PENDING_UPDATES_STATUS.REJECTED;
      await NotificationService.actionPendingUpdate(payload.id, status as PendingUpdateStatusType, req.userId, req.userId);
      ApiResponse.success(res, {}, 200, "Action Taken for Pending Item!!");
    } catch (error) {
      console.log(error);
      ApiResponse.error(
        res,
        "Something went happen. Please try again.",
        500,
        {isError: false}
      );
    }
  };

}
