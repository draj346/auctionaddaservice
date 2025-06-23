"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleController = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const role_service_1 = require("../services/role.service");
const roleService = new role_service_1.RoleService();
class RoleController {
}
exports.RoleController = RoleController;
_a = RoleController;
RoleController.createAdmin = async (req, res) => {
    const payload = { isAccessDenied: true };
    try {
        const playerId = parseInt(req.params.playerId);
        await roleService.createAdmin(playerId);
        apiResponse_1.ApiResponse.success(res, {}, 200, "Admin created successfully");
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, payload);
    }
};
RoleController.removeAdmin = async (req, res) => {
    const payload = { isAccessDenied: true };
    try {
        const playerId = parseInt(req.params.playerId);
        await roleService.deleteRole(playerId);
        apiResponse_1.ApiResponse.success(res, {}, 200, "Role remove successfully");
    }
    catch (error) {
        console.log(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, payload);
    }
};
RoleController.approvePlayers = async (req, res) => {
    try {
        const data = req.body;
        const accessChecks = data.playerIds.map(async (playerId) => {
            const hasSameLevelAccess = await role_service_1.RoleService.hasSameLevelAccess(req.role, playerId);
            return { playerId, allowed: !hasSameLevelAccess };
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
        const success = await roleService.approvePlayers(allowedPlayerIds);
        if (!success) {
            return apiResponse_1.ApiResponse.error(res, "Update failed", 200, {
                isUpdateFailed: true
            });
        }
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
