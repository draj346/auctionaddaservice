"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleController = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const role_service_1 = require("../services/role.service");
const notification_service_1 = require("../services/notification.service");
const notification_constants_1 = require("../constants/notification.constants");
class RoleController {
}
exports.RoleController = RoleController;
_a = RoleController;
RoleController.createAdmin = async (req, res) => {
    try {
        const playerId = parseInt(req.params.playerId);
        const result = await role_service_1.RoleService.createAdmin(playerId);
        if (result) {
            notification_service_1.NotificationService.createNotification(playerId, notification_constants_1.NotificationMessage.CHANGE_ROLE_TO_ADMIN, notification_constants_1.NOTIFICATIONS.PROFILE_UPDATE, req.userId, req.role);
            apiResponse_1.ApiResponse.success(res, {}, 200, "Admin created successfully");
        }
        else {
            apiResponse_1.ApiResponse.error(res, "Update Failed", 200, { isUpdateFailed: true });
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: false });
    }
};
RoleController.removeAdmin = async (req, res) => {
    try {
        const playerId = parseInt(req.params.playerId);
        const result = await role_service_1.RoleService.deleteRole(playerId);
        if (result) {
            notification_service_1.NotificationService.createNotification(playerId, notification_constants_1.NotificationMessage.REMOVE_ROLE_FROM_ADMIN, notification_constants_1.NOTIFICATIONS.PROFILE_UPDATE, req.userId, req.role);
            apiResponse_1.ApiResponse.success(res, {}, 200, "Role remove successfully");
        }
        else {
            apiResponse_1.ApiResponse.error(res, "Update Failed", 200, { isUpdateFailed: true });
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: false });
    }
};
RoleController.approvePlayers = async (req, res) => {
    try {
        const data = req.body;
        const accessChecks = data.playerIds.map(async (playerId) => {
            const hasAccess = await role_service_1.RoleService.isAdminOrAboveForDelete(req.role, playerId);
            return { playerId, allowed: hasAccess && playerId != req.userId };
        });
        const accessResults = await Promise.all(accessChecks);
        const allowedPlayerIds = accessResults
            .filter((result) => result.allowed)
            .map((result) => result.playerId);
        if (allowedPlayerIds.length === 0) {
            return apiResponse_1.ApiResponse.error(res, "Access Denied", 403, {
                isAccessDenied: true,
            });
        }
        const success = await role_service_1.RoleService.approvePlayers(allowedPlayerIds);
        if (!success) {
            return apiResponse_1.ApiResponse.error(res, "Update failed", 200, {
                isUpdateFailed: true
            });
        }
        notification_service_1.NotificationService.batchCreateNotification(allowedPlayerIds, notification_constants_1.NotificationMessage.APPROVED_PROFILE, notification_constants_1.NOTIFICATIONS.PROFILE_UPDATE, req.userId, req.role);
        if (data.playerIds.length !== allowedPlayerIds.length) {
            const skippedPlayerIds = data.playerIds.filter((id) => !allowedPlayerIds.includes(id));
            return apiResponse_1.ApiResponse.success(res, { skippedPlayerIds }, 200, "Some profiles approved successfully");
        }
        apiResponse_1.ApiResponse.success(res, { skippedPlayerIds: [] }, 200, "Players approved successfully");
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, {
            isError: true,
        });
    }
};
