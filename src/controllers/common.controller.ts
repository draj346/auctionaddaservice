import { Request, Response } from "express";
import { AuctionService } from "../services/auction.service";
import { IAuctionAttributesIdsSchema, IAuctionDetails, ICreateAuction } from "../types/auction.types";
import { ApiResponse } from "../utils/apiResponse";
import { RoleHelper } from "../helpers/roles.helpers";
import { NotificationService } from "../services/notification.service";
import { NotificationMessage, NOTIFICATIONS, NotificationType } from "../constants/notification.constants";
import { AuctionsHelper } from "../helpers/auctions.helpers";
import { FileService } from "../services/file.service";
import { DuplicateFile, toMySQLDate } from "../utils/common";
import { RoleService } from "../services/role.service";
import { ROLES } from "../constants/roles.constants";
import { FILE_UPLOAD_FOLDER } from "../config/env";
import { CommonService } from "../services/common.service";

export class CommonController {
  static getBanner = async (req: Request, res: Response) => {
    try {
      const bannerResponse = await CommonService.getBanner();
      if (bannerResponse) {
        ApiResponse.success(res, bannerResponse, 200, "Banner retrieve successfully!!");
      } else {
        ApiResponse.success(res, [], 200, "Something went happen. Please try again.");
      }
    } catch (error) {
      console.error(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static getDiscount = async (req: Request, res: Response) => {
    try {
      const discountResponse = await CommonService.getDiscount();
      if (discountResponse) {
        ApiResponse.success(res, discountResponse, 200, "Discount retrieve successfully!!");
      } else {
        ApiResponse.success(res, [], 200, "Something went happen. Please try again.");
      }
    } catch (error) {
      console.error(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

  static getYoutubeVideos = async (req: Request, res: Response) => {
    try {
      const youtubeResponse = await CommonService.getYoutubes();
      if (youtubeResponse) {
        ApiResponse.success(res, youtubeResponse, 200, "Videos retrieve successfully!!");
      } else {
        ApiResponse.success(res, [], 200, "Something went happen. Please try again.");
      }
    } catch (error) {
      console.error(error);
      ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
  };

}
