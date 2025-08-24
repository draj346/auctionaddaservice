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
exports.PlayerController = void 0;
const player_service_1 = require("../services/player.service");
const apiResponse_1 = require("../utils/apiResponse");
const XLSX = __importStar(require("xlsx"));
const role_service_1 = require("../services/role.service");
const roles_helpers_1 = require("../helpers/roles.helpers");
const auction_service_1 = require("../services/auction.service");
const playerService = new player_service_1.PlayerService();
class PlayerController {
}
exports.PlayerController = PlayerController;
_a = PlayerController;
PlayerController.getPlayers = async (req, res) => {
    try {
        const data = req.query;
        const page = data.page || 1;
        const search = data.search || "";
        const approved = data.approved || "all";
        const active = data.active || "all";
        const sort = data.sort || "";
        const limit = 100;
        const { players, total, hasMore } = await playerService.getPlayers(req.role, req.userId, page, limit, search, approved, sort, active);
        apiResponse_1.ApiResponse.success(res, { players, total, hasMore }, 200, "Players retrieved successfully");
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.");
    }
};
PlayerController.getPlayersById = async (req, res) => {
    try {
        const playerId = parseInt(req.params.playerId);
        if (!playerId) {
            return apiResponse_1.ApiResponse.error(res, "Player not found or update failed", 404, {
                isNotFound: true,
            });
        }
        const player = await playerService.getPlayerById(req.role, playerId, true, req.userId);
        if (player) {
            apiResponse_1.ApiResponse.success(res, player, 200, "Players retrieved successfully");
        }
        else {
            return apiResponse_1.ApiResponse.error(res, "Player not found or not eligible to view the profile", 404, {
                isAccessDenied: true,
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
PlayerController.getPlayersByIdForEdit = async (req, res) => {
    try {
        const playerId = parseInt(req.params.playerId);
        if (!playerId) {
            return apiResponse_1.ApiResponse.error(res, "Player not found or update failed", 404, {
                isNotFound: true,
            });
        }
        const hasAccess = await role_service_1.RoleService.isSelfOrAdminOrAbove(req.role, req.userId, playerId, true);
        let player = null;
        if (hasAccess) {
            player = await playerService.getPlayerById(req.role, playerId, true, req.userId);
        }
        if (player) {
            apiResponse_1.ApiResponse.success(res, player, 200, "Players retrieved successfully");
        }
        else {
            return apiResponse_1.ApiResponse.error(res, "Player not found or not eligible to view the profile", 404, {
                isAccessDenied: true,
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
PlayerController.exportPlayers = async (req, res) => {
    const sendExcel = (data, status, filename, sheetName = "Status") => {
        const ws = XLSX.utils.aoa_to_sheet(typeof data === "string" ? [[data]] : data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
        res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.status(status).send(buffer);
    };
    try {
        const data = req.body;
        let allowedPlayerIds = [];
        if (data.playerIds.length > 0) {
            const accessChecks = data.playerIds.map(async (playerId) => {
                const hasRoleLevelAccess = await role_service_1.RoleService.hasRoleAccessOnly(req.role, playerId);
                return { playerId, allowed: hasRoleLevelAccess };
            });
            const accessResults = await Promise.all(accessChecks);
            allowedPlayerIds = accessResults.filter((result) => result.allowed).map((result) => result.playerId);
            if (allowedPlayerIds.length === 0) {
                return sendExcel("Access Denied", 403, "access_denied.xlsx", "Error");
            }
        }
        const players = await playerService.getPlayerForExport(req.role, allowedPlayerIds);
        if (players.length === 0) {
            return sendExcel("No player data available for export", 200, "no_players_found.xlsx");
        }
        const allKeys = Object.keys(players[0]);
        const headers = allKeys.map((key) => key.replace(/_/g, " ").toUpperCase());
        const rows = players.map((player) => allKeys.map((key) => player[key] ?? null));
        return sendExcel([headers, ...rows], 200, `players_export_${Date.now()}.xlsx`, "Player Data");
    }
    catch (error) {
        console.error("Export error:", error);
        sendExcel("Internal server error. Please try again later.", 500, "server_error.xlsx", "Error");
    }
};
PlayerController.getAdmins = async (req, res) => {
    try {
        const data = req.query;
        const page = data.page || 1;
        const search = data.search || "";
        const limit = 100;
        const { players, total, hasMore } = await playerService.getAdmins(page, limit, search);
        apiResponse_1.ApiResponse.success(res, { players, total, hasMore }, 200, "Players retrieved successfully");
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.");
    }
};
PlayerController.getOwnerForTeam = async (req, res) => {
    try {
        const auctionId = parseInt(req.params.auctionId);
        const teamId = parseInt(req.params.teamId);
        const data = req.query;
        const search = data.search || "";
        let result;
        if (search) {
            result = await playerService.getPlayerForTeamOwnerByText(req.userId, teamId, search);
        }
        else {
            result = await playerService.getPlayerForTeamOwner(req.userId, auctionId, teamId);
        }
        apiResponse_1.ApiResponse.success(res, result, 200, "Players retrieved successfully");
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.");
    }
};
PlayerController.getPlayersForAuction = async (req, res) => {
    try {
        const auctionId = parseInt(req.params.auctionId);
        const data = req.query;
        const auctionInfo = await auction_service_1.AuctionService.getAuctionPlayerId(auctionId);
        if (!auctionInfo) {
            return apiResponse_1.ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
        }
        if (!roles_helpers_1.RoleHelper.isAdminAndAbove(req.role)) {
            if (auctionInfo.playerId !== req.userId) {
                return apiResponse_1.ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
            }
        }
        const page = data.page || 1;
        const search = data.search || "";
        const limit = 100;
        const { players, total, hasMore } = await playerService.getPlayersForAuction(req.userId, page, limit, search, auctionId);
        apiResponse_1.ApiResponse.success(res, { players, total, hasMore }, 200, "Players retrieved successfully");
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
PlayerController.getAddedPlayersForAuction = async (req, res) => {
    try {
        const auctionId = parseInt(req.params.auctionId);
        const data = req.query;
        const page = data.page || 1;
        const search = data.search || "";
        const limit = 100;
        const { players, total, hasMore } = await playerService.getAddedPlayersForAuction(req.userId, page, limit, search, auctionId);
        apiResponse_1.ApiResponse.success(res, { players, total, hasMore }, 200, "Players retrieved successfully");
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
PlayerController.getPlayersForCategory = async (req, res) => {
    try {
        const auctionId = parseInt(req.params.auctionId);
        const data = req.query;
        const auctionInfo = await auction_service_1.AuctionService.getAuctionPlayerId(auctionId);
        if (!auctionInfo) {
            return apiResponse_1.ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
        }
        if (!roles_helpers_1.RoleHelper.isAdminAndAbove(req.role)) {
            if (auctionInfo.playerId !== req.userId) {
                return apiResponse_1.ApiResponse.error(res, "Permission Denied", 200, { isAccessDenied: true });
            }
        }
        const page = data.page || 1;
        const search = data.search || "";
        const limit = 100;
        const { players, total, hasMore } = await playerService.getPlayersForCategory(page, limit, search, auctionId);
        apiResponse_1.ApiResponse.success(res, { players, total, hasMore }, 200, "Players retrieved successfully");
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
PlayerController.getParticipantPlayersForCategory = async (req, res) => {
    try {
        const auctionId = parseInt(req.params.auctionId);
        const categoryId = parseInt(req.params.categoryId);
        const data = req.query;
        const page = data.page || 1;
        const search = data.search || "";
        const limit = 100;
        const { players, total, hasMore } = await playerService.getparticipantPlayersForCategory(page, limit, search, auctionId, categoryId);
        apiResponse_1.ApiResponse.success(res, { players, total, hasMore }, 200, "Players retrieved successfully");
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
