"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationController = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const registration_service_1 = require("../services/registration.service");
const role_service_1 = require("../services/role.service");
const multerConfig_1 = require("../utils/multerConfig");
const XLSX = __importStar(require("xlsx"));
const notification_service_1 = require("../services/notification.service");
const notification_constants_1 = require("../constants/notification.constants");
const player_service_1 = require("../services/player.service");
const common_1 = require("../utils/common");
const sendMail_1 = require("../utils/sendMail");
const registrationService = new registration_service_1.RegistrationService();
const playerService = new player_service_1.PlayerService();
class RegistrationController {
}
exports.RegistrationController = RegistrationController;
_a = RegistrationController;
RegistrationController.initialRegistration = async (req, res) => {
    try {
        const data = req.body;
        const playerInfo = await registrationService.initialRegistration(data);
        apiResponse_1.ApiResponse.success(res, { ...playerInfo }, 200, playerInfo.playerId ? "Registration initiated successfully" : "Something went happen. Please try again.");
    }
    catch (error) {
        console.log("eror");
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.");
    }
};
RegistrationController.addPlayerInformation = async (req, res) => {
    try {
        const data = req.body;
        const isValidUser = await registrationService.isUserProfileSubmitted(data.playerId);
        if (!isValidUser) {
            apiResponse_1.ApiResponse.error(res, "Player not found or update failed", 400, {
                isRegistered: true,
            });
        }
        const success = await registrationService.addPlayerInformation(data);
        if (success) {
            const userInfo = await registrationService.getPlayerEmailById(data.playerId);
            if (userInfo?.email) {
                (0, sendMail_1.sendRegistrationEmail)(userInfo.email, userInfo.name || "");
            }
            notification_service_1.NotificationService.createNotification(data.playerId, notification_constants_1.NotificationMessage.ACCOUNT_CREATE_BY_SELF, notification_constants_1.NOTIFICATIONS.PROFILE_CREATED, data.playerId, req.role);
            apiResponse_1.ApiResponse.success(res, null, 200, "Registration completed successfully");
        }
        else {
            apiResponse_1.ApiResponse.error(res, "Player not found or update failed", 404);
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.");
    }
};
RegistrationController.addPlayers = async (req, res) => {
    try {
        const data = req.body;
        const result = await registrationService.createProfile(data);
        if (result && result.playerId) {
            (0, sendMail_1.sendRegistrationEmail)(data.email, data.name);
            apiResponse_1.ApiResponse.success(res, { ...result }, 200, "Player added successfully");
            notification_service_1.NotificationService.createNotification(result.playerId, notification_constants_1.NotificationMessage.ACCOUNT_CREATE_BY_ELSE, notification_constants_1.NOTIFICATIONS.PROFILE_CREATED, req.userId, req.role);
        }
        else {
            apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 200, result, { isError: true });
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, {
            isError: true,
        });
    }
};
RegistrationController.updatePlayersByRole = async (req, res) => {
    try {
        const data = req.body;
        data.playerId = parseInt(req.params.playerId);
        const hasAccess = await role_service_1.RoleService.isSelfOrAdminOrAbove(req.role, req.userId, data.playerId);
        if (!hasAccess) {
            return apiResponse_1.ApiResponse.error(res, "Access Denied", 403, {
                isAccessDenied: true,
            });
        }
        let previousInfo = null;
        if (req.userId !== data.playerId) {
            previousInfo = await playerService.getPlayerById(req.role, data.playerId, true, req.userId);
        }
        const success = await registrationService.updateProfile(data);
        if (success) {
            const message = req.userId === data.playerId
                ? notification_constants_1.NotificationMessage.ACCOUNT_UPDATE_BY_SELF
                : notification_constants_1.NotificationMessage.ACCOUNT_UPDATE_BY_ELSE;
            notification_service_1.NotificationService.createNotification(data.playerId, message, notification_constants_1.NOTIFICATIONS.PROFILE_UPDATE, req.userId, req.role);
            if (req.userId !== data.playerId) {
                if (previousInfo) {
                    const updatedInfo = { ...data };
                    if (data.image) {
                        const image = await playerService.getImageUrl(data.image);
                        updatedInfo.image = image;
                    }
                    const { previousData, updatedData } = (0, common_1.getChangedData)(previousInfo, updatedInfo);
                    notification_service_1.NotificationService.createPendingUpdate(data.playerId, req.userId, updatedData, notification_constants_1.NotificationMessage.APPROVAL_REQUEST, req.role, notification_constants_1.NOTIFICATIONS.APPROVAL_REQUEST, previousData);
                }
            }
            apiResponse_1.ApiResponse.success(res, { playerId: data.playerId }, 200, "Profile updated successfully");
        }
        else {
            apiResponse_1.ApiResponse.error(res, "Player not found or update failed", 404, {
                isError: true,
            });
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, {
            isError: true,
        });
    }
};
RegistrationController.deletePlayer = async (req, res) => {
    try {
        const playerId = parseInt(req.params.playerId);
        const hasAccess = await role_service_1.RoleService.isAdminOrAboveForDelete(req.role, playerId);
        if (!hasAccess) {
            return apiResponse_1.ApiResponse.error(res, "Access Denied", 403, {
                isAccessDenied: true,
            });
        }
        const success = await registrationService.deleteProfile(playerId);
        if (success) {
            apiResponse_1.ApiResponse.success(res, null, 200, "Profile deleted successfully");
        }
        else {
            apiResponse_1.ApiResponse.error(res, "Player not found or update failed", 404, {
                isError: true,
            });
        }
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, {
            isError: true,
        });
    }
};
RegistrationController.deactivatePlayers = async (req, res) => {
    try {
        const data = req.body;
        const accessChecks = data.playerIds.map(async (playerId) => {
            const hasAccess = await role_service_1.RoleService.isAdminOrAboveForDelete(req.role, playerId);
            return { playerId, allowed: hasAccess && playerId != req.userId };
        });
        const accessResults = await Promise.all(accessChecks);
        const allowedPlayerIds = accessResults.filter((result) => result.allowed).map((result) => result.playerId);
        if (allowedPlayerIds.length === 0) {
            return apiResponse_1.ApiResponse.error(res, "Access Denied", 403, {
                isAccessDenied: true,
            });
        }
        const success = await registrationService.deactivatePlayers(allowedPlayerIds);
        if (!success) {
            return apiResponse_1.ApiResponse.error(res, "Players not found or update failed", 404, { isUpdateFailed: true });
        }
        if (data.playerIds.length !== allowedPlayerIds.length) {
            const skippedPlayerIds = data.playerIds.filter((id) => !allowedPlayerIds.includes(id));
            return apiResponse_1.ApiResponse.success(res, { skippedPlayerIds }, 200, "Some profiles deactivated successfully");
        }
        return apiResponse_1.ApiResponse.success(res, { skippedPlayerIds: [] }, 200, "Profiles deactivated successfully");
    }
    catch (error) {
        console.error("Deactivation error:", error);
        return apiResponse_1.ApiResponse.error(res, "Something went wrong. Please try again.", 500, { isError: true });
    }
};
RegistrationController.activatePlayers = async (req, res) => {
    try {
        const data = req.body;
        const accessChecks = data.playerIds.map(async (playerId) => {
            const hasAccess = await role_service_1.RoleService.isAdminOrAboveForDelete(req.role, playerId);
            return { playerId, allowed: hasAccess && playerId != req.userId };
        });
        const accessResults = await Promise.all(accessChecks);
        const allowedPlayerIds = accessResults.filter((result) => result.allowed).map((result) => result.playerId);
        if (allowedPlayerIds.length === 0) {
            return apiResponse_1.ApiResponse.error(res, "Access Denied", 403, {
                isAccessDenied: true,
            });
        }
        const success = await registrationService.activatePlayers(allowedPlayerIds);
        if (!success) {
            return apiResponse_1.ApiResponse.error(res, "Players not found or update failed", 404, { isUpdateFailed: true });
        }
        if (data.playerIds.length !== allowedPlayerIds.length) {
            const skippedPlayerIds = data.playerIds.filter((id) => !allowedPlayerIds.includes(id));
            return apiResponse_1.ApiResponse.success(res, { skippedPlayerIds }, 200, "Some profiles activated successfully");
        }
        return apiResponse_1.ApiResponse.success(res, { skippedPlayerIds: [] }, 200, "Profiles activated successfully");
    }
    catch (error) {
        console.error("activation error:", error);
        return apiResponse_1.ApiResponse.error(res, "Something went wrong. Please try again.", 500, { isError: true });
    }
};
RegistrationController.AddMultiplePlayers = async (req, res) => {
    try {
        await new Promise((resolve, reject) => {
            multerConfig_1.uploadToMemory.single("file")(req, res, (err) => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
        if (!req.file) {
            return apiResponse_1.ApiResponse.error(res, "No file uploaded", 400, { isUpdateFailed: true });
        }
        if (!req.file.buffer || req.file.buffer.length === 0) {
            return apiResponse_1.ApiResponse.error(res, "Empty file buffer", 400, { isNotFound: true });
        }
        const workbook = XLSX.read(req.file.buffer, {
            type: "buffer",
            cellDates: true,
            sheetStubs: true,
        });
        if (!workbook.SheetNames.length || !workbook.Sheets[workbook.SheetNames[0]]) {
            return apiResponse_1.ApiResponse.error(res, "No worksheets found in Excel file", 400, { isNotFound: true });
        }
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const users = XLSX.utils.sheet_to_json(worksheet, {
            header: [
                "Full Name",
                "Mobile",
                "Email",
                "State",
                "District",
                "Jersey Number",
                "T-Shirt Size",
                "Lower Size",
                "Has Cricheroes Profile",
                "Is Paid Player",
                "Price Per Match",
                "Will Join Any Owner",
                "Player Role",
                "Batting Style",
                "Bowling Style",
                "Description"
            ],
            range: 1,
            defval: null,
        });
        if (!worksheet["Q1"] || worksheet["Q1"].v !== "Result") {
            XLSX.utils.sheet_add_aoa(worksheet, [["Result"]], { origin: "Q1" });
        }
        const allowedPlayerIds = [];
        const emailIds = [];
        const processedUsers = await Promise.all(users.map(async (user, index) => {
            const row = index + 2;
            try {
                const response = await registrationService.createProfileForExcel(user);
                if (response.playerId) {
                    allowedPlayerIds.push(response.playerId);
                    emailIds.push(user.Email);
                }
                return { ...user, Result: "Success", Row: row };
            }
            catch (error) {
                return {
                    ...user,
                    Result: `Error: ${error.message}`,
                    Row: row,
                };
            }
        }));
        processedUsers.forEach((user) => {
            XLSX.utils.sheet_add_aoa(worksheet, [[user.Result]], {
                origin: `Q${user.Row}`,
            });
        });
        if (emailIds.length > 0) {
            (0, sendMail_1.sendRegistrationEmail)(emailIds, '');
        }
        notification_service_1.NotificationService.batchCreateNotification(allowedPlayerIds, notification_constants_1.NotificationMessage.ACCOUNT_CREATE_BY_ELSE, notification_constants_1.NOTIFICATIONS.PROFILE_CREATED, req.userId, req.role);
        const updatedBuffer = XLSX.write(workbook, {
            type: "buffer",
            bookType: "xlsx",
        });
        res.setHeader("Content-Disposition", "attachment; filename=processed_results.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(updatedBuffer);
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Uploading failed. Please try again.", 500, { isError: true });
    }
};
RegistrationController.updateToNonPlayers = async (req, res) => {
    try {
        const data = req.body;
        const accessChecks = data.playerIds.map(async (playerId) => {
            const hasAccess = await role_service_1.RoleService.isAdminOrAboveForDelete(req.role, playerId);
            return { playerId, allowed: hasAccess && playerId != req.userId };
        });
        const accessResults = await Promise.all(accessChecks);
        const allowedPlayerIds = accessResults.filter((result) => result.allowed).map((result) => result.playerId);
        if (allowedPlayerIds.length === 0) {
            return apiResponse_1.ApiResponse.error(res, "Access Denied", 403, {
                isAccessDenied: true,
            });
        }
        const success = await registrationService.updateToNonPlayers(allowedPlayerIds);
        if (!success) {
            return apiResponse_1.ApiResponse.error(res, "Players not found or update failed", 404, { isUpdateFailed: true });
        }
        notification_service_1.NotificationService.batchCreateNotification(allowedPlayerIds, notification_constants_1.NotificationMessage.STATUS_CHANGE_TO_NON_PLAYER, notification_constants_1.NOTIFICATIONS.PROFILE_UPDATE, req.userId, req.role);
        if (data.playerIds.length !== allowedPlayerIds.length) {
            const skippedPlayerIds = data.playerIds.filter((id) => !allowedPlayerIds.includes(id));
            return apiResponse_1.ApiResponse.success(res, { skippedPlayerIds }, 200, "Some profiles updated to Non Players successfully");
        }
        return apiResponse_1.ApiResponse.success(res, { skippedPlayerIds: [] }, 200, "Profiles updated to Non Players successfully");
    }
    catch (error) {
        console.error("error:", error);
        return apiResponse_1.ApiResponse.error(res, "Something went wrong. Please try again.", 500, { isError: true });
    }
};
RegistrationController.updateToPlayers = async (req, res) => {
    try {
        const data = req.body;
        const accessChecks = data.playerIds.map(async (playerId) => {
            const hasAccess = await role_service_1.RoleService.isAdminOrAboveForDelete(req.role, playerId);
            return { playerId, allowed: hasAccess && playerId != req.userId };
        });
        const accessResults = await Promise.all(accessChecks);
        const allowedPlayerIds = accessResults.filter((result) => result.allowed).map((result) => result.playerId);
        if (allowedPlayerIds.length === 0) {
            return apiResponse_1.ApiResponse.error(res, "Access Denied", 403, {
                isAccessDenied: true,
            });
        }
        const success = await registrationService.updateToPlayers(allowedPlayerIds);
        if (!success) {
            return apiResponse_1.ApiResponse.error(res, "Players not found or update failed", 404, { isUpdateFailed: true });
        }
        notification_service_1.NotificationService.batchCreateNotification(allowedPlayerIds, notification_constants_1.NotificationMessage.STATUS_CHANGE_TO_PLAYER, notification_constants_1.NOTIFICATIONS.PROFILE_UPDATE, req.userId, req.role);
        if (data.playerIds.length !== allowedPlayerIds.length) {
            const skippedPlayerIds = data.playerIds.filter((id) => !allowedPlayerIds.includes(id));
            return apiResponse_1.ApiResponse.success(res, { skippedPlayerIds }, 200, "Some profiles updated to Players successfully");
        }
        return apiResponse_1.ApiResponse.success(res, { skippedPlayerIds: [] }, 200, "Profiles updated to Players successfully");
    }
    catch (error) {
        console.error("error:", error);
        return apiResponse_1.ApiResponse.error(res, "Something went wrong. Please try again.", 500, { isError: true });
    }
};
