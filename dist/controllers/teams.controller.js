"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamsController = void 0;
const auction_service_1 = require("../services/auction.service");
const apiResponse_1 = require("../utils/apiResponse");
const roles_helpers_1 = require("../helpers/roles.helpers");
const notification_service_1 = require("../services/notification.service");
const notification_constants_1 = require("../constants/notification.constants");
const auctions_helpers_1 = require("../helpers/auctions.helpers");
const file_service_1 = require("../services/file.service");
const env_1 = require("../config/env");
const role_service_1 = require("../services/role.service");
const fileService = new file_service_1.FileService();
class TeamsController {
}
exports.TeamsController = TeamsController;
_a = TeamsController;
TeamsController.upsetTeam = async (req, res) => {
    try {
        const data = req.body;
        const auctionId = parseInt(req.params.auctionId);
        data.auctionId = auctionId;
        if (!data.teamId) {
            const flag = await _a.canAddNewTeam(auctionId);
            if (!flag) {
                return apiResponse_1.ApiResponse.error(res, "Permission Denied", 200, { isFreeLimitReached: true });
            }
        }
        const auctionPlayerId = await auction_service_1.AuctionService.isValidAuctionPlayerIdForEdit(data.auctionId);
        if (!auctionPlayerId) {
            return apiResponse_1.ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
        }
        if (!roles_helpers_1.RoleHelper.isAdminAndAbove(req.role)) {
            if (auctionPlayerId !== req.userId) {
                return apiResponse_1.ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
            }
        }
        const newTeamId = await auction_service_1.AuctionService.upsetTeam(data);
        if (newTeamId) {
            if (data.teamId) {
                notification_service_1.NotificationService.createNotification(auctionPlayerId, auctionPlayerId === req.userId
                    ? notification_constants_1.NotificationMessage.TEAM_UPDATE_BY_SELF
                    : notification_constants_1.NotificationMessage.TEAM_UPDATE_BY_ELSE, notification_constants_1.NOTIFICATIONS.CATEGORY_UPDATED, req.userId, req.role, auctions_helpers_1.AuctionsHelper.getNotificationJSON(data.name));
            }
            else {
                notification_service_1.NotificationService.createNotification(auctionPlayerId, notification_constants_1.NotificationMessage.TEAM_CREATE_BY_SELF, notification_constants_1.NOTIFICATIONS.TEAM_CREATED, req.userId, req.role, auctions_helpers_1.AuctionsHelper.getNotificationJSON(data.name));
            }
            return apiResponse_1.ApiResponse.success(res, {}, 200, data.teamId ? "Team updated successfully!!" : "Team created successfully!!");
        }
        return apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 200, { isError: true });
    }
    catch (error) {
        console.log(error);
        return apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
TeamsController.getTeamsByAuction = async (req, res) => {
    try {
        const auctionId = parseInt(req.params.auctionId);
        let teamResponse = await auction_service_1.AuctionService.getTeamsByAuctionId(auctionId);
        if (teamResponse) {
            teamResponse = await _a.updateFilePaths(teamResponse);
            apiResponse_1.ApiResponse.success(res, teamResponse, 200, "Auction Category retrieve successfully!!");
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
TeamsController.deleteTeam = async (req, res) => {
    try {
        const auctionId = parseInt(req.params.auctionId);
        const teamId = parseInt(req.params.teamId);
        const teamResponse = await auction_service_1.AuctionService.deleteTeamsById(teamId, roles_helpers_1.RoleHelper.isAdminAndAbove(req.role), req.userId, auctionId);
        if (teamResponse) {
            const response = {};
            if (teamResponse.status) {
                if (teamResponse.imagePath) {
                    await fileService.deleteUploadedFile(teamResponse.imagePath);
                }
                if (roles_helpers_1.RoleHelper.isOrganiser(req.role)) {
                    notification_service_1.NotificationService.createNotification(teamResponse.playerId || req.userId, teamResponse.playerId === req.userId
                        ? notification_constants_1.NotificationMessage.TEAM_DELETED_BY_SELF
                        : notification_constants_1.NotificationMessage.TEAM_DELETED_BY_ELSE, notification_constants_1.NOTIFICATIONS.TEAM_DELETED, req.userId, req.role, auctions_helpers_1.AuctionsHelper.getNotificationJSON(teamResponse.name || ""));
                }
                if (teamResponse.isNotFound !== undefined)
                    response.isNotFound = teamResponse.isNotFound;
                if (teamResponse.status !== undefined)
                    response.status = teamResponse.status;
                if (teamResponse.isAccessDenied !== undefined)
                    response.isAccessDenied = teamResponse.isAccessDenied;
                if (teamResponse.isLive !== undefined)
                    response.isLive = teamResponse.isLive;
                if (teamResponse.isError !== undefined)
                    response.isError = teamResponse.isError;
                apiResponse_1.ApiResponse.success(res, response, 200, "Team Deleted!!");
            }
            else {
                apiResponse_1.ApiResponse.error(res, "Unable to delete Team. Please try again", 200, { isError: true });
            }
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
TeamsController.getTeamById = async (req, res) => {
    try {
        const auctionId = parseInt(req.params.auctionId);
        const teamId = parseInt(req.params.teamId);
        let teamResponse = await auction_service_1.AuctionService.getTeamById(auctionId, teamId);
        let teamOwnerResponse = await auction_service_1.AuctionService.getTeamOwnerInfo(teamId);
        if (teamResponse) {
            teamResponse = await _a.updateFilePath(teamResponse);
            const response = {
                team: teamResponse,
                owners: teamOwnerResponse || [],
            };
            apiResponse_1.ApiResponse.success(res, response, 200, "Team Details!!");
        }
        else {
            apiResponse_1.ApiResponse.error(res, "Unable to retrieve Team. Please try again", 200, { isNotFound: true });
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
TeamsController.getTeamsByAuctionId = async (req, res) => {
    try {
        const auctionId = parseInt(req.params.auctionId);
        let teamResponse = await auction_service_1.AuctionService.getTeamByAuctionId(auctionId);
        let teamOwnerResponse = await auction_service_1.AuctionService.getOwnerByAuctionId(auctionId);
        if (teamResponse) {
            teamResponse = await _a.updateAuctionFilePaths(teamResponse);
            const teamsWithOwners = teamResponse.map((team) => {
                const teamOwners = teamOwnerResponse
                    ?.filter((owner) => owner.teamId === team.teamId)
                    ?.map((owner) => ({
                    name: owner.name,
                    type: owner.type,
                    playerId: owner.playerId
                })) || [];
                return {
                    image: team.image || "",
                    name: team.name,
                    shortName: team.shortName,
                    shortcutKey: team.shortcutKey,
                    teamId: team.teamId,
                    owners: teamOwners,
                };
            });
            apiResponse_1.ApiResponse.success(res, teamsWithOwners, 200, "Team Details!!");
        }
        else {
            apiResponse_1.ApiResponse.error(res, "Unable to retrieve Team. Please try again", 200, { isNotFound: true });
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
TeamsController.assignOwnerToTeam = async (req, res) => {
    try {
        const data = req.body;
        if (!roles_helpers_1.RoleHelper.isAdminAndAbove(req.role)) {
            const isAuctionValid = await auction_service_1.AuctionService.isValidAuctionForAccess(data.auctionId, req.userId);
            if (!isAuctionValid) {
                return apiResponse_1.ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
            }
        }
        let teamResponse = await auction_service_1.AuctionService.assignOwnerToTeam(data);
        if (teamResponse) {
            const ownerRole = (await role_service_1.RoleService.getUserRole(data.ownerId));
            if (roles_helpers_1.RoleHelper.isPlayer(ownerRole)) {
                const roleResult = await role_service_1.RoleService.createOwner(data.ownerId);
                if (roleResult) {
                    notification_service_1.NotificationService.createNotification(data.ownerId, notification_constants_1.NotificationMessage.CHANGE_ROLE_TO_OWNER, notification_constants_1.NOTIFICATIONS.ROLE_UPDATED, req.userId, req.role);
                }
            }
            apiResponse_1.ApiResponse.success(res, teamResponse, 200, "Team Details!!");
        }
        else {
            apiResponse_1.ApiResponse.error(res, "Unable to retrieve Team. Please try again", 200, { isNotFound: true });
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
TeamsController.removeOwnerFromTeam = async (req, res) => {
    try {
        const data = req.body;
        if (!roles_helpers_1.RoleHelper.isAdminAndAbove(req.role)) {
            const isAuctionValid = await auction_service_1.AuctionService.isValidAuctionForAccess(data.auctionId, req.userId);
            if (!isAuctionValid) {
                return apiResponse_1.ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
            }
        }
        let teamResponse = await auction_service_1.AuctionService.removeOwnerFromTeam(data);
        if (teamResponse) {
            const ownerRole = (await role_service_1.RoleService.getUserRole(data.ownerId));
            if (roles_helpers_1.RoleHelper.isOwner(ownerRole)) {
                const roleResult = await role_service_1.RoleService.deleteRole(data.ownerId);
                if (roleResult) {
                    notification_service_1.NotificationService.createNotification(data.ownerId, notification_constants_1.NotificationMessage.REMOVE_ROLE_FROM_OWNER, notification_constants_1.NOTIFICATIONS.ROLE_UPDATED, req.userId, req.role);
                }
            }
            apiResponse_1.ApiResponse.success(res, {}, 200, "Team Owner Removed!!");
        }
        else {
            apiResponse_1.ApiResponse.error(res, "Unable to remove from Team Owner. Please try again", 200, { isNotFound: true });
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
TeamsController.canAddTeam = async (req, res) => {
    try {
        const auctionId = parseInt(req.params.auctionId);
        const response = await _a.canAddNewTeam(auctionId);
        apiResponse_1.ApiResponse.success(res, { status: response }, 200, "Team Status Retrieved Successfully");
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.success(res, { status: false }, 200, "Team Status Retrieved Successfully");
    }
};
TeamsController.retainPlayerToTeam = async (req, res) => {
    try {
        const data = {
            ...req.body,
            operation: "RETAIN",
            requesterId: req.userId,
            isAdmin: roles_helpers_1.RoleHelper.isAdminAndAbove(req.role),
        };
        return _a.playerToTeamOperation(data, req.role, res);
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
TeamsController.addPlayerToTeam = async (req, res) => {
    try {
        const data = {
            ...req.body,
            operation: "NEW",
            requesterId: req.userId,
            isAdmin: roles_helpers_1.RoleHelper.isAdminAndAbove(req.role),
        };
        return _a.playerToTeamOperation(data, req.role, res);
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
TeamsController.removePlayerFromTeam = async (req, res) => {
    try {
        const data = {
            ...req.body,
            operation: "REMOVE",
            requesterId: req.userId,
            isAdmin: roles_helpers_1.RoleHelper.isAdminAndAbove(req.role),
        };
        return _a.playerToTeamOperation(data, req.role, res);
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
TeamsController.tempRemovePlayerFromTeam = async (req, res) => {
    try {
        const data = {
            ...req.body,
            operation: "TRIAL_REMOVE",
            requesterId: req.userId,
            isAdmin: roles_helpers_1.RoleHelper.isAdminAndAbove(req.role),
        };
        return _a.playerToTeamOperation(data, req.role, res);
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
TeamsController.getTeamPlayerCount = async (req, res) => {
    try {
        const auctionId = parseInt(req.params.auctionId);
        const teamId = parseInt(req.params.teamId);
        const response = await auction_service_1.AuctionService.getTeamPlayerCountByTeamId(auctionId, teamId);
        apiResponse_1.ApiResponse.success(res, { total: response }, 200, "Pending Players for Auction!!");
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
TeamsController.playerToTeamOperation = async (data, role, res) => {
    const response = await auction_service_1.AuctionService.updatePlayerToTeam(data);
    if (response) {
        if (response.status) {
            data.playerIds.forEach((id) => {
                if (id !== response.playerId) {
                    if (data.requesterId === response.playerId || data.isAdmin) {
                        notification_service_1.NotificationService.createNotification(id, notification_constants_1.NotificationMessage.PLAYER_RETAIN_FOR_TEAM, notification_constants_1.NOTIFICATIONS.PLAYER_ADDED_TO_TEAM, data.requesterId, role, auctions_helpers_1.AuctionsHelper.getNotificationJSON(response.name || ""));
                    }
                }
            });
            apiResponse_1.ApiResponse.success(res, {}, 200, ["REMOVE", "TRIAL_REMOVE"].includes(data.operation) ? "Successfully removed from team!!!" : "Successfully added to Team!!");
        }
        else {
            const teamResponse = {};
            if (response.isNotFound !== undefined)
                teamResponse.isNotFound = response.isNotFound;
            if (response.status !== undefined)
                teamResponse.status = response.status;
            if (response.isAccessDenied !== undefined)
                teamResponse.isAccessDenied = response.isAccessDenied;
            if (response.isError !== undefined)
                teamResponse.isError = response.isError;
            if (response.limitReached !== undefined)
                teamResponse.limitReached = response.limitReached;
            apiResponse_1.ApiResponse.error(res, "Unable to add to Team. Please try again", 200, teamResponse);
        }
    }
};
TeamsController.canAddNewTeam = async (auctionId) => {
    try {
        const auctionPaymentStatus = await auction_service_1.AuctionService.isPaymentDoneForAuction(auctionId);
        if (!auctionPaymentStatus) {
            let countResponse = await auction_service_1.AuctionService.getTeamCount(auctionId);
            return countResponse < env_1.FREE_TEAM_CREATE_LIMIT;
        }
        else {
            return true;
        }
    }
    catch (error) {
        console.log(error);
        return false;
    }
};
TeamsController.updateFilePaths = async (teamResponse) => {
    if (teamResponse.length > 0) {
        const imageIds = [...new Set(teamResponse.map((a) => a.imageId))].filter((id) => id !== null);
        if (imageIds.length > 0) {
            const files = await fileService.getFiles(imageIds);
            if (files) {
                const fileMap = new Map();
                files.forEach((file) => fileMap.set(file.fileId, file.path));
                return teamResponse.map((team) => ({
                    ...team,
                    imagePath: team.imageId !== null ? fileMap.get(team.imageId) || "" : "",
                }));
            }
        }
    }
    return teamResponse;
};
TeamsController.updateAuctionFilePaths = async (teamResponse) => {
    if (teamResponse.length > 0) {
        const imageIds = [...new Set(teamResponse.map((a) => a.imageId))].filter((id) => id !== null);
        if (imageIds.length > 0) {
            const files = await fileService.getFiles(imageIds);
            if (files) {
                const fileMap = new Map();
                files.forEach((file) => fileMap.set(file.fileId, file.path));
                return teamResponse.map((team) => ({
                    ...team,
                    image: team.imageId !== null ? fileMap.get(team.imageId) || "" : "",
                }));
            }
        }
    }
    return teamResponse;
};
TeamsController.updateFilePath = async (teamResponse) => {
    if (teamResponse.imageId) {
        const imageIds = [teamResponse.imageId];
        const files = await fileService.getFiles(imageIds);
        if (files?.length === 1) {
            teamResponse.imagePath = files[0].path;
        }
    }
    return teamResponse;
};
