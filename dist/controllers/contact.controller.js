"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactController = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const notification_service_1 = require("../services/notification.service");
const notification_constants_1 = require("../constants/notification.constants");
const contact_service_1 = require("../services/contact.service");
class ContactController {
}
exports.ContactController = ContactController;
_a = ContactController;
ContactController.insertComment = async (req, res) => {
    try {
        const data = req.body;
        const result = await contact_service_1.ContactService.insertComment(data);
        if (result) {
            return apiResponse_1.ApiResponse.success(res, {}, 200, "Information add successfully!!");
        }
        else {
            return apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 200, { isError: true });
        }
    }
    catch (error) {
        console.log(error);
        return apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
ContactController.getUnWorkComment = async (req, res) => {
    try {
        let auctionResponse = await contact_service_1.ContactService.getUnWorkComment();
        apiResponse_1.ApiResponse.success(res, auctionResponse, 200, "Contact Message Retrieve Successfully!!");
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
ContactController.updateWorkStatus = async (req, res) => {
    try {
        const data = req.body;
        data.playerId = req.userId;
        const result = await contact_service_1.ContactService.updateWorkStatus(data);
        if (result) {
            notification_service_1.NotificationService.createNotification(req.userId, notification_constants_1.NotificationMessage.CONTACT_MESSAGE_WORKED_DONE, notification_constants_1.NOTIFICATIONS.GENERAL, req.userId, req.role);
            apiResponse_1.ApiResponse.success(res, {}, 200, "User auctions retrieve successfully!!");
        }
        else {
            apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 200, { isError: true });
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
ContactController.getWorkComment = async (req, res) => {
    try {
        let auctionResponse = await contact_service_1.ContactService.getWorkComment();
        apiResponse_1.ApiResponse.success(res, auctionResponse, 200, "Contact Message Retrieve Successfully!!");
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
