import { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse";
import { RoleService } from "../services/role.service";
import { ErrorResponsePayload } from "../types";
import { PlayerIdsSchema } from "../types/player.types";
import { NotificationService } from "../services/notification.service";
import { IUpdatePendingUpdate } from "../types/notification.types";


export class NotificationController {
  static getMyNotification = async (req: Request, res: Response) => {
    try {
      const notifications = await NotificationService.getUserNotifications(req.userId);
      const count = await NotificationService.getNewNotificationsCount(req.userId);
       ApiResponse.success(res, {notifications, count}, 200, "Notification");
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
      const count = await NotificationService.getNewNotificationsCount(req.userId);
       ApiResponse.success(res, {count}, 200, "YOu Have new Notification");
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

  static getMyPendingActionList = async (req: Request, res: Response) => {
    try {
      const pendingActions = await NotificationService.getPendingUpdates(req.userId);
       ApiResponse.success(res, {pendingActions, total: pendingActions.length}, 200, "Your Pending Action List!!");
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
      await NotificationService.actionPendingUpdate(payload.id, payload.status, req.userId, req.userId);
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
