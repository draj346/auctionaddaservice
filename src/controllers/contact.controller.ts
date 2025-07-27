import { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse";
import { NotificationService } from "../services/notification.service";
import { NotificationMessage, NOTIFICATIONS, NotificationType } from "../constants/notification.constants";
import { ICreateContactMessage, IUpdateContactMessage } from "../types/contact.types";
import { ContactService } from "../services/contact.service";

export class ContactController {
  static insertComment = async (req: Request, res: Response) => {
    try {
      const data: ICreateContactMessage = req.body;
      const result = await ContactService.insertComment(data);
      if (result) {
        return ApiResponse.success(res, {}, 200, "Information add successfully!!");
      } else {
        return ApiResponse.error(res, "Something went happen. Please try again.", 200, { isError: true });
      }
    } catch (error) {
      console.log(error);
      return ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static getUnWorkComment = async (req: Request, res: Response) => {
    try {
      let auctionResponse = await ContactService.getUnWorkComment();
      ApiResponse.success(res, auctionResponse, 200, "Contact Message Retrieve Successfully!!");
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static updateWorkStatus = async (req: Request, res: Response) => {
    try {
      const data: IUpdateContactMessage = req.body;
      data.playerId = req.userId;
      const result = await ContactService.updateWorkStatus(data);
      if (result) {
        NotificationService.createNotification(
          req.userId,
          NotificationMessage.CONTACT_MESSAGE_WORKED_DONE,
          NOTIFICATIONS.GENERAL as NotificationType,
          req.userId,
          req.role
        );
        ApiResponse.success(res, {}, 200, "User auctions retrieve successfully!!");
      } else {
        ApiResponse.error(res, "Something went happen. Please try again.", 200, { isError: true });
      }
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static getWorkComment = async (req: Request, res: Response) => {
    try {
      let auctionResponse = await ContactService.getWorkComment();
      ApiResponse.success(res, auctionResponse, 200, "Contact Message Retrieve Successfully!!");
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };
}
