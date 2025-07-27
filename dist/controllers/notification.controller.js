"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const notification_service_1 = require("../services/notification.service");
const notification_constants_1 = require("../constants/notification.constants");
class NotificationController {
}
exports.NotificationController = NotificationController;
_a = NotificationController;
NotificationController.getMyNotification = async (req, res) => {
    try {
        const notifications = await notification_service_1.NotificationService.getUserNotifications(req.userId);
        const pendingActions = await notification_service_1.NotificationService.getPendingUpdates(req.userId);
        const count = await notification_service_1.NotificationService.getNewNotificationsCount(req.userId);
        const response = {
            Notifications: notifications,
            PendingActions: pendingActions,
            Total: count.total
        };
        apiResponse_1.ApiResponse.success(res, response, 200, "Notification List");
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: false });
    }
};
NotificationController.getNewNotificationCount = async (req, res) => {
    try {
        const total = await notification_service_1.NotificationService.getNewNotificationsCount(req.userId);
        apiResponse_1.ApiResponse.success(res, total, 200, "You Have new Notification");
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: false });
    }
};
NotificationController.updateIsRead = async (req, res) => {
    try {
        const count = await notification_service_1.NotificationService.updateIsRead(req.userId);
        apiResponse_1.ApiResponse.success(res, {}, 200, "Notification Read Successfully!!");
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: false });
    }
};
NotificationController.updatePendingAction = async (req, res) => {
    try {
        const payload = req.body;
        const status = payload.status ? notification_constants_1.PENDING_UPDATES_STATUS.APPROVED : notification_constants_1.PENDING_UPDATES_STATUS.REJECTED;
        await notification_service_1.NotificationService.actionPendingUpdate(payload.id, status, req.userId, req.userId);
        apiResponse_1.ApiResponse.success(res, {}, 200, "Action Taken for Pending Item!!");
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: false });
    }
};
