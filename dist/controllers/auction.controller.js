"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionController = void 0;
const auction_service_1 = require("../services/auction.service");
const apiResponse_1 = require("../utils/apiResponse");
const roles_helpers_1 = require("../helpers/roles.helpers");
const notification_service_1 = require("../services/notification.service");
const notification_constants_1 = require("../constants/notification.constants");
const auctions_helpers_1 = require("../helpers/auctions.helpers");
const file_service_1 = require("../services/file.service");
const common_1 = require("../utils/common");
const role_service_1 = require("../services/role.service");
const roles_constants_1 = require("../constants/roles.constants");
const env_1 = require("../config/env");
const fileService = new file_service_1.FileService();
class AuctionController {
}
exports.AuctionController = AuctionController;
_a = AuctionController;
AuctionController.upsetAuction = async (req, res) => {
    try {
        const data = req.body;
        data.startDate = (0, common_1.toMySQLDate)(data.startDate);
        let playerId;
        if (!data.auctionId) {
            playerId = req.userId;
            data.playerId = playerId;
            if (!roles_helpers_1.RoleHelper.isAdminAndAbove(req.role)) {
                const isFreeLimitReached = await auction_service_1.AuctionService.isAuctionInPendingState(playerId);
                if (isFreeLimitReached) {
                    return apiResponse_1.ApiResponse.error(res, "Access Denied", 200, { isFreeLimitReached: true });
                }
            }
        }
        else {
            const auctionInfo = await auction_service_1.AuctionService.getAuctionPlayerId(data.auctionId);
            if (!auctionInfo?.playerId) {
                return apiResponse_1.ApiResponse.error(res, "Auction Not Found", 200, { isNotFound: true });
            }
            playerId = auctionInfo.playerId;
            data.playerId = auctionInfo.playerId;
            if (!roles_helpers_1.RoleHelper.isAdminAndAbove(req.role) && auctionInfo.playerId !== req.userId) {
                return apiResponse_1.ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
            }
        }
        const newAuctionId = await auction_service_1.AuctionService.upsetAuction(data);
        if (newAuctionId) {
            if (data.auctionId) {
                notification_service_1.NotificationService.createNotification(playerId, playerId === req.userId
                    ? notification_constants_1.NotificationMessage.AUCTION_UPDATE_BY_SELF
                    : notification_constants_1.NotificationMessage.AUCTION_UPDATE_BY_ELSE, notification_constants_1.NOTIFICATIONS.AUCTION_UPDATED, req.userId, req.role, auctions_helpers_1.AuctionsHelper.getNotificationJSON(data.name, data.state));
            }
            else {
                const code = auctions_helpers_1.AuctionsHelper.generateAuctionCode(newAuctionId, req.name, req.role);
                await auction_service_1.AuctionService.updateAuctionCode(code, newAuctionId);
                notification_service_1.NotificationService.createNotification(playerId, notification_constants_1.NotificationMessage.AUCTION_CREATE_BY_SELF, notification_constants_1.NOTIFICATIONS.AUCTION_CREATED, req.userId, req.role, auctions_helpers_1.AuctionsHelper.getNotificationJSON(data.name, data.state, code));
            }
            return apiResponse_1.ApiResponse.success(res, {}, 200, data.auctionId ? "Auction updated successfully!!" : "Auction created successfully!!");
        }
        return apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 200, { isError: true });
    }
    catch (error) {
        console.log(error);
        return apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
AuctionController.getAuctions = async (req, res) => {
    try {
        let auctionResponse = await auction_service_1.AuctionService.getAuctions(req.userId);
        if (auctionResponse) {
            auctionResponse = await _a.updateFilePaths(auctionResponse);
            apiResponse_1.ApiResponse.success(res, auctionResponse, 200, "User auctions retrieve successfully!!");
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
AuctionController.getUpcomingAuctions = async (req, res) => {
    try {
        let auctionResponse = await auction_service_1.AuctionService.getUpcomingAuctions();
        if (auctionResponse) {
            auctionResponse = await _a.updateFilePaths(auctionResponse);
            apiResponse_1.ApiResponse.success(res, auctionResponse, 200, "Auctions retrieve successfully!!");
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
AuctionController.getLiveAuctions = async (req, res) => {
    try {
        let auctionResponse = await auction_service_1.AuctionService.getLiveAuctions();
        if (auctionResponse) {
            auctionResponse = await _a.updateFilePaths(auctionResponse);
            apiResponse_1.ApiResponse.success(res, auctionResponse, 200, "Auctions retrieve successfully!!");
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
AuctionController.getAuctionsForCopy = async (req, res) => {
    try {
        if (!roles_helpers_1.RoleHelper.isAdminAndAbove(req.role)) {
            const isFreeLimitReached = await auction_service_1.AuctionService.isAuctionInPendingState(req.userId);
            if (isFreeLimitReached) {
                return apiResponse_1.ApiResponse.error(res, "Access Denied", 200, { isFreeLimitReached: true });
            }
        }
        const auctionResponse = await auction_service_1.AuctionService.getAuctionsForCopy(req.userId, req.role);
        apiResponse_1.ApiResponse.success(res, auctionResponse, 200, "Auctions retrieve successfully!!");
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
AuctionController.copyAuction = async (req, res) => {
    try {
        const auctionId = parseInt(req.params.auctionId);
        const isAdmin = roles_helpers_1.RoleHelper.isAdminAndAbove(req.role);
        if (!isAdmin) {
            const isFreeLimitReached = await auction_service_1.AuctionService.isAuctionInPendingState(req.userId);
            if (isFreeLimitReached) {
                return apiResponse_1.ApiResponse.error(res, "Access Denied", 200, { isFreeLimitReached: true });
            }
        }
        const auctionResponse = await auction_service_1.AuctionService.copyAuctionById(auctionId, req.userId, isAdmin, env_1.FREE_TEAM_CREATE_LIMIT);
        if (auctionResponse) {
            const response = {};
            if (auctionResponse?.status && auctionResponse.auctionId) {
                const code = auctions_helpers_1.AuctionsHelper.generateAuctionCode(auctionResponse.auctionId, req.name, req.role);
                await auction_service_1.AuctionService.updateAuctionCode(code, auctionResponse.auctionId);
                if (auctionResponse.imageId && auctionResponse.imagePath) {
                    const fileResponse = await (0, common_1.DuplicateFile)(auctionResponse.imagePath);
                    if (fileResponse.name) {
                        const url = `${env_1.FILE_UPLOAD_FOLDER}${fileResponse.name}`;
                        fileService.updateFileOnly({
                            name: fileResponse.name,
                            path: fileResponse.path,
                            url,
                            fileId: auctionResponse.imageId,
                        });
                    }
                }
                if (auctionResponse.qrCodeId && auctionResponse.qrCodePath) {
                    const qrCodeResponse = await (0, common_1.DuplicateFile)(auctionResponse.qrCodePath);
                    if (qrCodeResponse.name) {
                        const url = `${env_1.FILE_UPLOAD_FOLDER}${qrCodeResponse.name}`;
                        fileService.updateFileOnly({
                            name: qrCodeResponse.name,
                            path: qrCodeResponse.path,
                            url,
                            fileId: auctionResponse.qrCodeId,
                        });
                    }
                }
                notification_service_1.NotificationService.createNotification(auctionResponse?.playerId || req.userId, auctionResponse.playerId === req.userId
                    ? notification_constants_1.NotificationMessage.AUCTION_COPY_BY_SELF
                    : notification_constants_1.NotificationMessage.AUCTION_COPY_BY_ELSE, notification_constants_1.NOTIFICATIONS.AUCTION_CREATED, req.userId, req.role, auctions_helpers_1.AuctionsHelper.getNotificationJSON(auctionResponse.name || "", auctionResponse.state || "", code || ""));
                apiResponse_1.ApiResponse.success(res, {}, 200, "Copy Auctions result!!");
            }
            else {
                if (auctionResponse.status !== undefined)
                    response.status = auctionResponse.status;
                if (auctionResponse.isAccessDenied !== undefined)
                    response.isAccessDenied = auctionResponse.isAccessDenied;
                if (auctionResponse.isError !== undefined)
                    response.isError = auctionResponse.isError;
                apiResponse_1.ApiResponse.error(res, "Copy Auctions result!!", 200, response);
            }
        }
        else {
            apiResponse_1.ApiResponse.error(res, "Unable to copy Auction. Please try again", 200, { isError: true });
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
AuctionController.deleteAuction = async (req, res) => {
    try {
        const auctionId = parseInt(req.params.auctionId);
        const auctionResponse = await auction_service_1.AuctionService.deleteAuctionById(auctionId || 0, req.userId, roles_helpers_1.RoleHelper.isAdminAndAbove(req.role));
        if (auctionResponse) {
            const response = {};
            if (auctionResponse.status && auctionResponse.playerId) {
                if (auctionResponse.imagePath) {
                    await fileService.deleteUploadedFile(auctionResponse.imagePath);
                }
                if (auctionResponse.qrCodePath) {
                    await fileService.deleteUploadedFile(auctionResponse.qrCodePath);
                }
                if (roles_helpers_1.RoleHelper.isOrganiser(req.role)) {
                    const isOrganiser = auction_service_1.AuctionService.isOrganiser(auctionResponse.playerId);
                    if (!isOrganiser) {
                        const roleResult = await role_service_1.RoleService.deleteRole(auctionResponse.playerId);
                        if (roleResult) {
                            notification_service_1.NotificationService.createNotification(auctionResponse.playerId, notification_constants_1.NotificationMessage.REMOVE_ROLE_FROM_ORGANISER, notification_constants_1.NOTIFICATIONS.ROLE_UPDATED, auctionResponse.playerId, roles_constants_1.ROLES.PLAYER);
                            response.isNoAuctionAvailable = true;
                        }
                    }
                }
                notification_service_1.NotificationService.createNotification(auctionResponse.playerId, auctionResponse.playerId === req.userId
                    ? notification_constants_1.NotificationMessage.AUCTION_DELETED_BY_SELF
                    : notification_constants_1.NotificationMessage.AUCTION_DELETED_BY_ELSE, notification_constants_1.NOTIFICATIONS.AUCTION_DELETED, req.userId, req.role, auctions_helpers_1.AuctionsHelper.getNotificationJSON(auctionResponse.name || "", auctionResponse.state || "", auctionResponse.code || ""));
            }
            if (auctionResponse.status !== undefined)
                response.status = auctionResponse.status;
            if (auctionResponse.isAccessDenied !== undefined)
                response.isAccessDenied = auctionResponse.isAccessDenied;
            if (auctionResponse.isNotFound !== undefined)
                response.isNotFound = auctionResponse.isNotFound;
            if (auctionResponse.isLocked !== undefined)
                response.isLocked = auctionResponse.isLocked;
            apiResponse_1.ApiResponse.success(res, response, 200, "Auction Details!!");
        }
        else {
            apiResponse_1.ApiResponse.error(res, "Unable to delete Auction. Please try again", 200, { isError: true });
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
AuctionController.updateAuctionCompletionStatus = async (req, res) => {
    try {
        const auctionId = parseInt(req.params.auctionId);
        let auctionResponse = await auction_service_1.AuctionService.updateAuctionCompletionStatus(auctionId);
        if (auctionResponse) {
            const auctionInfo = await auction_service_1.AuctionService.getAuctionName(auctionId);
            notification_service_1.NotificationService.createNotification(auctionInfo?.playerId || req.userId, notification_constants_1.NotificationMessage.AUCTION_COMPLETED, notification_constants_1.NOTIFICATIONS.AUCTION_UPDATED, req.userId, req.role, auctions_helpers_1.AuctionsHelper.getNotificationJSON(auctionInfo?.name || "", auctionInfo?.state || "", auctionInfo?.code || ""));
            apiResponse_1.ApiResponse.success(res, {}, 200, "auctions completed successfully!!");
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
AuctionController.approveAuction = async (req, res) => {
    try {
        const auctionId = parseInt(req.params.auctionId);
        let auctionResponse = await auction_service_1.AuctionService.approveAuction(auctionId);
        if (auctionResponse) {
            const auctionInfo = await auction_service_1.AuctionService.getAuctionName(auctionId);
            if (auctionInfo?.playerId && !roles_helpers_1.RoleHelper.isOrganiserAndAbove(req.role)) {
                const roleResult = await role_service_1.RoleService.createOrganiser(auctionInfo?.playerId);
                if (roleResult) {
                    notification_service_1.NotificationService.createNotification(auctionInfo.playerId, notification_constants_1.NotificationMessage.CHANGE_ROLE_TO_ORGANISER, notification_constants_1.NOTIFICATIONS.ROLE_UPDATED, req.userId, req.role);
                }
            }
            notification_service_1.NotificationService.createNotification(auctionInfo?.playerId || req.userId, notification_constants_1.NotificationMessage.AUCTION_APPROVED_BY_ELSE, notification_constants_1.NOTIFICATIONS.AUCTION_APPROVED, req.userId, req.role, auctions_helpers_1.AuctionsHelper.getNotificationJSON(auctionInfo?.name || "", auctionInfo?.state || "", auctionInfo?.code || ""));
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
AuctionController.approvePlayerForAuction = async (req, res) => {
    try {
        const data = req.body;
        const auctionInfo = await auction_service_1.AuctionService.getAuctionPlayerId(data.auctionId);
        if (!auctionInfo) {
            return apiResponse_1.ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
        }
        if (!roles_helpers_1.RoleHelper.isAdminAndAbove(req.role)) {
            if (auctionInfo.playerId !== req.userId) {
                return apiResponse_1.ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
            }
        }
        const response = await auction_service_1.AuctionService.approvePlayerToAuction(data);
        if (response) {
            data.playerIds.forEach((id) => {
                notification_service_1.NotificationService.createNotification(id, notification_constants_1.NotificationMessage.PLAYER_APPROVED_FOR_AUCTION, notification_constants_1.NOTIFICATIONS.PLAYER_AUCTION_APPROVED, req.userId, req.role, auctions_helpers_1.AuctionsHelper.getNotificationJSON(auctionInfo.name, undefined, auctionInfo.code));
            });
            apiResponse_1.ApiResponse.success(res, {}, 200, "Player Approved for Auctions successfully!!");
        }
        else {
            apiResponse_1.ApiResponse.error(res, "Unable to approved player for auction. Please try again", 200, { isError: true });
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
AuctionController.starPlayerForAuction = async (req, res) => {
    try {
        const data = req.body;
        const response = await auction_service_1.AuctionService.starPlayerForAuction(data);
        if (response) {
            apiResponse_1.ApiResponse.success(res, {}, 200, "Player updated successfully!!");
        }
        else {
            apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again", 200, { isError: true });
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
AuctionController.unStarPlayerForAuction = async (req, res) => {
    try {
        const data = req.body;
        const response = await auction_service_1.AuctionService.unStarPlayerForAuction(data);
        if (response) {
            apiResponse_1.ApiResponse.success(res, {}, 200, "Player updated successfully!!");
        }
        else {
            apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again", 200, { isError: true });
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
AuctionController.getAuctionBySearch = async (req, res) => {
    try {
        const data = req.query;
        let auctionResponse = await auction_service_1.AuctionService.getAuctionDetailsbySearch(data.searchText || "");
        if (auctionResponse) {
            auctionResponse = await _a.updateFilePaths(auctionResponse);
            apiResponse_1.ApiResponse.success(res, auctionResponse, 200, "Auction Details!!");
        }
        else {
            apiResponse_1.ApiResponse.error(res, "Unable to retrieve Auction. Please try again", 200, { isError: true });
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
AuctionController.getAuctionById = async (req, res) => {
    try {
        const auctionId = parseInt(req.params.auctionId);
        if (!roles_helpers_1.RoleHelper.isAdminAndAbove(req.role)) {
            const isValidAuction = await auction_service_1.AuctionService.isValidAuctionForAccess(auctionId, req.userId);
            if (!isValidAuction) {
                return apiResponse_1.ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
            }
        }
        let auctionResponse = await auction_service_1.AuctionService.getAuctionDetails(auctionId);
        if (auctionResponse) {
            auctionResponse = await _a.updateFilePath(auctionResponse);
            apiResponse_1.ApiResponse.success(res, auctionResponse, 200, "Auction Details!!");
        }
        else {
            apiResponse_1.ApiResponse.error(res, "Unable to retrieve Auction. Please try again", 200, { isError: true });
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
AuctionController.addPlayerToAuction = async (req, res) => {
    try {
        const data = {
            ...req.body,
            operation: "ASSIGN_AUCTION",
        };
        if (!roles_helpers_1.RoleHelper.isAdminAndAbove(req.role)) {
            const isValidAuction = await auction_service_1.AuctionService.isValidAuctionForAccess(data.auctionId, req.userId);
            if (!isValidAuction) {
                return apiResponse_1.ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
            }
        }
        const response = await auction_service_1.AuctionService.updatePlayerToAuction(data);
        if (response) {
            const categoryResponse = {};
            if (response.status) {
                data.playerIds.forEach((id) => {
                    if (id !== response.playerId) {
                        if (id === req.userId) {
                            notification_service_1.NotificationService.createNotification(response.playerId || req.userId, notification_constants_1.NotificationMessage.PLAYER_ADDED_TO_AUCTION_BY_SELF, notification_constants_1.NOTIFICATIONS.PLAYER_ADDED, req.userId, req.role, auctions_helpers_1.AuctionsHelper.getNotificationJSON(response.name || ""));
                        }
                        else if (req.userId === response.playerId || roles_helpers_1.RoleHelper.isAdminAndAbove(req.role)) {
                            notification_service_1.NotificationService.createNotification(id, notification_constants_1.NotificationMessage.PLAYER_ADDED_TO_AUCTION_BY_ELSE, notification_constants_1.NOTIFICATIONS.PLAYER_ADDED, req.userId, req.role, auctions_helpers_1.AuctionsHelper.getNotificationJSON(response.name || ""));
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
                apiResponse_1.ApiResponse.success(res, categoryResponse, 200, "Successfully added to Auction!!");
            }
            else {
                apiResponse_1.ApiResponse.error(res, "Unable to add to auction. Please try again", 200, { isError: true });
            }
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
AuctionController.joinPlayerToAuction = async (req, res) => {
    try {
        const data = {
            ...req.body,
            operation: "ASSIGN_SELF",
            playerIds: [req.userId],
        };
        const playerId = await auction_service_1.AuctionService.isValidAuctionPlayerIdForEdit(data.auctionId);
        if (!playerId) {
            return apiResponse_1.ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
        }
        const response = await auction_service_1.AuctionService.updatePlayerToAuction(data);
        if (response) {
            const auctionResponse = {};
            if (response.status) {
                notification_service_1.NotificationService.createNotification(playerId, notification_constants_1.NotificationMessage.PLAYER_JOINED_AUCTION, notification_constants_1.NOTIFICATIONS.PLAYER_JOINED, req.userId, req.role, auctions_helpers_1.AuctionsHelper.getNotificationJSON(response.name || "", "", "", "", req.name));
                if (response.isNotFound !== undefined)
                    auctionResponse.isNotFound = response.isNotFound;
                if (response.status !== undefined)
                    auctionResponse.status = response.status;
                if (response.isAccessDenied !== undefined)
                    auctionResponse.isAccessDenied = response.isAccessDenied;
                if (response.isLive !== undefined)
                    auctionResponse.isLive = response.isLive;
                if (response.isError !== undefined)
                    auctionResponse.isError = response.isError;
                apiResponse_1.ApiResponse.success(res, auctionResponse, 200, "Successfully added to Auction!!");
            }
            else {
                apiResponse_1.ApiResponse.error(res, "Unable to add to auction. Please try again", 200, { isError: true });
            }
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
AuctionController.removeSelfFromAuction = async (req, res) => {
    try {
        const auctionId = parseInt(req.params.auctionId);
        const data = {
            auctionId,
            operation: "REMOVE_AUCTION",
            playerIds: [req.userId],
        };
        const playerId = await auction_service_1.AuctionService.isValidAuctionPlayerIdForEdit(data.auctionId);
        if (!playerId) {
            return apiResponse_1.ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
        }
        const response = await auction_service_1.AuctionService.updatePlayerToAuction(data);
        if (response) {
            const auctionResponse = {};
            if (response.status) {
                notification_service_1.NotificationService.createNotification(playerId, notification_constants_1.NotificationMessage.PLAYER_REMOVED_SELF_AUCTION, notification_constants_1.NOTIFICATIONS.PLAYER_EXIT, req.userId, req.role, auctions_helpers_1.AuctionsHelper.getNotificationJSON(response.name || "", "", "", "", req.name));
                if (response.isNotFound !== undefined)
                    auctionResponse.isNotFound = response.isNotFound;
                if (response.status !== undefined)
                    auctionResponse.status = response.status;
                if (response.isAccessDenied !== undefined)
                    auctionResponse.isAccessDenied = response.isAccessDenied;
                if (response.isLive !== undefined)
                    auctionResponse.isLive = response.isLive;
                if (response.isError !== undefined)
                    auctionResponse.isError = response.isError;
                apiResponse_1.ApiResponse.success(res, auctionResponse, 200, "Successfully exited from Auction!!");
            }
            else {
                apiResponse_1.ApiResponse.error(res, "Unable to remove from auction. Please try again", 200, { isError: true });
            }
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
AuctionController.removePlayerFromAuction = async (req, res) => {
    try {
        const data = {
            ...req.body,
            operation: "REMOVE_AUCTION",
        };
        const auctionInfo = await auction_service_1.AuctionService.getAuctionPlayerId(data.auctionId);
        if (!auctionInfo) {
            return apiResponse_1.ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
        }
        if (!roles_helpers_1.RoleHelper.isAdminAndAbove(req.role)) {
            if (auctionInfo.playerId !== req.userId) {
                return apiResponse_1.ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
            }
        }
        const response = await auction_service_1.AuctionService.updatePlayerToAuction(data);
        if (response) {
            const categoryResponse = {};
            if (response.status) {
                data.playerIds.forEach((id) => {
                    if (id !== response.playerId) {
                        if (id === req.userId) {
                            notification_service_1.NotificationService.createNotification(response.playerId || req.userId, notification_constants_1.NotificationMessage.PLAYER_REMOVED_FROM_AUCTION_BY_SELF, notification_constants_1.NOTIFICATIONS.PLAYER_REMOVED, req.userId, req.role, auctions_helpers_1.AuctionsHelper.getNotificationJSON(response.name || ""));
                        }
                        else if (req.userId === response.playerId || roles_helpers_1.RoleHelper.isAdminAndAbove(req.role)) {
                            notification_service_1.NotificationService.createNotification(id, notification_constants_1.NotificationMessage.PLAYER_REMOVED_FROM_AUCTION_BY_ELSE, notification_constants_1.NOTIFICATIONS.PLAYER_REMOVED, req.userId, req.role, auctions_helpers_1.AuctionsHelper.getNotificationJSON(response.name || ""));
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
                apiResponse_1.ApiResponse.success(res, categoryResponse, 200, "Successfully removed from Auction!!");
            }
            else {
                apiResponse_1.ApiResponse.error(res, "Unable to remove from auction. Please try again", 200, { isError: true });
            }
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
AuctionController.getPendingPlayerCountForAuction = async (req, res) => {
    try {
        const auctionId = parseInt(req.params.auctionId);
        if (!roles_helpers_1.RoleHelper.isAdminAndAbove(req.role)) {
            const isValidAuction = await auction_service_1.AuctionService.isValidAuctionForAccess(auctionId, req.userId);
            if (!isValidAuction) {
                return apiResponse_1.ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
            }
        }
        const response = await auction_service_1.AuctionService.getPendingPlayerCountForAuction(auctionId);
        apiResponse_1.ApiResponse.success(res, { total: response }, 200, "Pending Players for Auction!!");
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
AuctionController.updateFilePaths = async (auctionResponse) => {
    if (auctionResponse.length > 0) {
        const imageIds = [...new Set(auctionResponse.map((a) => a.imageId))].filter((id) => id !== null);
        if (imageIds.length > 0) {
            const files = await fileService.getFiles(imageIds);
            if (files) {
                const fileMap = new Map();
                files.forEach((file) => fileMap.set(file.fileId, file.path));
                return auctionResponse.map((auction) => ({
                    ...auction,
                    imagePath: auction.imageId !== null ? fileMap.get(auction.imageId) || "" : "",
                }));
            }
        }
    }
    return auctionResponse;
};
AuctionController.updateFilePath = async (auctionResponse) => {
    if (auctionResponse.imageId) {
        const imageIds = [auctionResponse.imageId];
        const files = await fileService.getFiles(imageIds);
        if (files?.length === 1) {
            auctionResponse.imagePath = files[0].path;
        }
    }
    if (auctionResponse.qrCodeId) {
        const imageIds = [auctionResponse.qrCodeId];
        const files = await fileService.getFiles(imageIds);
        if (files?.length === 1) {
            auctionResponse.qrCodePath = files[0].path;
        }
    }
    return auctionResponse;
};
AuctionController.getAuctionByCodeForJoin = async (req, res) => {
    try {
        const data = req.query;
        let auctionResponse = await auction_service_1.AuctionService.getAuctionDetailsByCode(data.code || "", req.userId);
        if (auctionResponse) {
            auctionResponse = await _a.updateFilePath(auctionResponse);
            apiResponse_1.ApiResponse.success(res, auctionResponse, 200, "Auction Details!!");
        }
        else {
            apiResponse_1.ApiResponse.error(res, "Unable to retrieve Auction. Please try again", 200, { isNotFound: true });
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
AuctionController.getMyAuctions = async (req, res) => {
    try {
        let auctionResponse = await auction_service_1.AuctionService.getMyAuctions(req.userId);
        if (auctionResponse) {
            apiResponse_1.ApiResponse.success(res, auctionResponse, 200, "Auction Details!!");
        }
        else {
            apiResponse_1.ApiResponse.error(res, "Unable to retrieve Auction. Please try again", 200, { isNotFound: true });
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
