"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const auction_service_1 = require("../services/auction.service");
const apiResponse_1 = require("../utils/apiResponse");
const roles_helpers_1 = require("../helpers/roles.helpers");
const notification_service_1 = require("../services/notification.service");
const notification_constants_1 = require("../constants/notification.constants");
const auctions_helpers_1 = require("../helpers/auctions.helpers");
class CategoryController {
}
exports.CategoryController = CategoryController;
_a = CategoryController;
CategoryController.upsetCategory = async (req, res) => {
    try {
        const data = req.body;
        const auctionId = parseInt(req.params.auctionId);
        data.auctionId = auctionId;
        const auctionPlayerId = await auction_service_1.AuctionService.isValidAuctionPlayerIdForEdit(data.auctionId);
        if (!auctionPlayerId) {
            return apiResponse_1.ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
        }
        if (!roles_helpers_1.RoleHelper.isAdminAndAbove(req.role)) {
            if (auctionPlayerId !== req.userId) {
                return apiResponse_1.ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
            }
        }
        const newCategoryId = await auction_service_1.AuctionService.upsetCategory(data);
        if (newCategoryId) {
            if (data.categoryId) {
                notification_service_1.NotificationService.createNotification(auctionPlayerId, auctionPlayerId === req.userId
                    ? notification_constants_1.NotificationMessage.CATEGORY_UPDATE_BY_SELF
                    : notification_constants_1.NotificationMessage.CATEGORY_UPDATE_BY_ELSE, notification_constants_1.NOTIFICATIONS.CATEGORY_UPDATED, req.userId, req.role, auctions_helpers_1.AuctionsHelper.getNotificationJSON(data.name));
            }
            else {
                notification_service_1.NotificationService.createNotification(auctionPlayerId, notification_constants_1.NotificationMessage.CATEGORY_CREATE_BY_SELF, notification_constants_1.NOTIFICATIONS.CATEGORY_CREATED, req.userId, req.role, auctions_helpers_1.AuctionsHelper.getNotificationJSON(data.name));
            }
            return apiResponse_1.ApiResponse.success(res, {}, 200, data.categoryId ? "Category updated successfully!!" : "Category created successfully!!");
        }
        return apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 200, { isError: true });
    }
    catch (error) {
        console.log(error);
        return apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
CategoryController.getCategoryByAuction = async (req, res) => {
    try {
        const auctionId = parseInt(req.params.auctionId);
        let auctionResponse = await auction_service_1.AuctionService.getCategoriesByAuctionId(auctionId);
        if (auctionResponse) {
            apiResponse_1.ApiResponse.success(res, auctionResponse, 200, "Auction Category retrieve successfully!!");
        }
        else {
            apiResponse_1.ApiResponse.success(res, [], 200, "Something went happen. Please try again.");
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
CategoryController.deleteCategory = async (req, res) => {
    try {
        console.error('yes');
        const auctionId = parseInt(req.params.auctionId);
        const categoryId = parseInt(req.params.categoryId);
        const categoryResponse = await auction_service_1.AuctionService.deleteCategoryById(categoryId, roles_helpers_1.RoleHelper.isAdminAndAbove(req.role), req.userId, auctionId);
        if (categoryResponse) {
            const response = {};
            if (categoryResponse.status) {
                if (roles_helpers_1.RoleHelper.isOrganiser(req.role)) {
                    notification_service_1.NotificationService.createNotification(categoryResponse.playerId || req.userId, categoryResponse.playerId === req.userId
                        ? notification_constants_1.NotificationMessage.CATEGORY_DELETED_BY_SELF
                        : notification_constants_1.NotificationMessage.CATEGORY_DELETED_BY_ELSE, notification_constants_1.NOTIFICATIONS.CATEGORY_DELETED, req.userId, req.role, auctions_helpers_1.AuctionsHelper.getNotificationJSON(categoryResponse.name || ""));
                }
                if (categoryResponse.isNotFound !== undefined)
                    response.isNotFound = categoryResponse.isNotFound;
                if (categoryResponse.status !== undefined)
                    response.status = categoryResponse.status;
                if (categoryResponse.isAccessDenied !== undefined)
                    response.isAccessDenied = categoryResponse.isAccessDenied;
                if (categoryResponse.isLive !== undefined)
                    response.isLive = categoryResponse.isLive;
                if (categoryResponse.isError !== undefined)
                    response.isError = categoryResponse.isError;
                apiResponse_1.ApiResponse.success(res, response, 200, "Catergory Deleted!!");
            }
            else {
                apiResponse_1.ApiResponse.error(res, "Unable to delete Category. Please try again", 200, { isError: true });
            }
        }
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 200, { isError: true });
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
CategoryController.getcategoryById = async (req, res) => {
    try {
        const auctionId = parseInt(req.params.auctionId);
        const categoryId = parseInt(req.params.categoryId);
        let auctionResponse = await auction_service_1.AuctionService.getCategoryById(auctionId, categoryId);
        if (auctionResponse) {
            apiResponse_1.ApiResponse.success(res, auctionResponse, 200, "Category Details!!");
        }
        else {
            apiResponse_1.ApiResponse.error(res, "Unable to retrieve Category. Please try again", 200, { isNotFound: true });
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
CategoryController.addPlayerToCategory = async (req, res) => {
    try {
        const data = {
            ...req.body,
            operation: "ASSIGN_CATEGORY",
        };
        const response = await auction_service_1.AuctionService.updatePlayerToAuction(data);
        if (response) {
            const categoryResponse = {};
            if (response.status) {
                data.playerIds.forEach((id) => {
                    if (id !== response.playerId) {
                        if (id === req.userId) {
                            notification_service_1.NotificationService.createNotification(response.playerId || req.userId, notification_constants_1.NotificationMessage.PLAYER_ADDED_TO_CATEGORY_BY_SELF, notification_constants_1.NOTIFICATIONS.PLAYER_ADDED, req.userId, req.role, auctions_helpers_1.AuctionsHelper.getNotificationJSON(response.name || "", undefined, undefined, response.categoryName));
                        }
                        else if (req.userId === response.playerId || roles_helpers_1.RoleHelper.isAdminAndAbove(req.role)) {
                            notification_service_1.NotificationService.createNotification(id, notification_constants_1.NotificationMessage.PLAYER_ADDED_TO_CATEGORY_BY_ELSE, notification_constants_1.NOTIFICATIONS.PLAYER_ADDED, req.userId, req.role, auctions_helpers_1.AuctionsHelper.getNotificationJSON(response.name || "", undefined, undefined, response.categoryName));
                        }
                    }
                });
                if (response.isNotFound !== undefined)
                    categoryResponse.isNotFound = response.isNotFound;
                if (response.status !== undefined)
                    categoryResponse.status = response.status;
                if (response.isAccessDenied !== undefined)
                    categoryResponse.isAccessDenied = response.isAccessDenied;
                if (response.isLive !== undefined)
                    categoryResponse.isLive = response.isLive;
                if (response.isError !== undefined)
                    categoryResponse.isError = response.isError;
                apiResponse_1.ApiResponse.success(res, categoryResponse, 200, "Successfully added to Category!!");
            }
            else {
                apiResponse_1.ApiResponse.error(res, "Unable to add to category. Please try again", 200, { isError: true });
            }
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
CategoryController.removePlayerFromCategory = async (req, res) => {
    try {
        const data = {
            ...req.body,
            operation: "REMOVE_CATEGORY",
        };
        const response = await auction_service_1.AuctionService.updatePlayerToAuction(data);
        if (response) {
            const categoryResponse = {};
            if (response.status) {
                data.playerIds.forEach((id) => {
                    if (id !== response.playerId) {
                        if (id === req.userId) {
                            notification_service_1.NotificationService.createNotification(response.playerId || req.userId, notification_constants_1.NotificationMessage.PLAYER_REMOVED_FROM_CATEGORY_BY_SELF, notification_constants_1.NOTIFICATIONS.PLAYER_REMOVED, req.userId, req.role, auctions_helpers_1.AuctionsHelper.getNotificationJSON(response.name || "", undefined, undefined, response.categoryName));
                        }
                        else if (req.userId === response.playerId || roles_helpers_1.RoleHelper.isAdminAndAbove(req.role)) {
                            notification_service_1.NotificationService.createNotification(id, notification_constants_1.NotificationMessage.PLAYER_REMOVED_FROM_CATEGORY_BY_ELSE, notification_constants_1.NOTIFICATIONS.PLAYER_REMOVED, req.userId, req.role, auctions_helpers_1.AuctionsHelper.getNotificationJSON(response.name || "", undefined, undefined, response.categoryName));
                        }
                    }
                });
                if (response.isNotFound !== undefined)
                    categoryResponse.isNotFound = response.isNotFound;
                if (response.status !== undefined)
                    categoryResponse.status = response.status;
                if (response.isAccessDenied !== undefined)
                    categoryResponse.isAccessDenied = response.isAccessDenied;
                if (response.isLive !== undefined)
                    categoryResponse.isLive = response.isLive;
                if (response.isError !== undefined)
                    categoryResponse.isError = response.isError;
                apiResponse_1.ApiResponse.success(res, categoryResponse, 200, "Successfully removed from Category!!");
            }
            else {
                apiResponse_1.ApiResponse.error(res, "Unable to remove from category. Please try again", 200, { isError: true });
            }
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
