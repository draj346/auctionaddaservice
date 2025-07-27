"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckOwnerOnlyPermission = exports.CheckOwnerWithOrganiserPermission = exports.CheckOrganiserPermission = exports.CheckPermission = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const roles_helpers_1 = require("../helpers/roles.helpers");
const CheckPermission = (permissionRoles) => {
    return (req, res, next) => {
        try {
            // 1. Super Admin bypass
            if (roles_helpers_1.RoleHelper.isSuperAdmin(req.role)) {
                return next();
            }
            // 2. Check if user role is in permissionRoles
            if (permissionRoles.includes(req.role)) {
                return next();
            }
            // 3. Permission denied
            return apiResponse_1.ApiResponse.error(res, `Forbidden: You don't have proper permission to do this activity`, 403, { isAccessDenied: true });
        }
        catch (error) {
            return apiResponse_1.ApiResponse.error(res, 'Permission check failed', 500, { isError: true });
        }
    };
};
exports.CheckPermission = CheckPermission;
const CheckOrganiserPermission = (role, permissionRoles) => {
    return (req, res, next) => {
        try {
            // 1. Super Admin and Admin bypass
            if (roles_helpers_1.RoleHelper.isAdminAndAbove(req.role)) {
                return next();
            }
            // 2. Check if user has access to auction
            if (permissionRoles.includes(req.role)) {
                return next();
            }
            // 3. Permission denied
            return apiResponse_1.ApiResponse.error(res, `Forbidden: You don't have proper permission to do this activity`, 403, { isAccessDenied: true });
        }
        catch (error) {
            return apiResponse_1.ApiResponse.error(res, 'Permission check failed', 500, { isError: true });
        }
    };
};
exports.CheckOrganiserPermission = CheckOrganiserPermission;
const CheckOwnerWithOrganiserPermission = (role, permissionRoles) => {
    return (req, res, next) => {
        try {
            // 1. Super Admin and Admin bypass
            if (roles_helpers_1.RoleHelper.isAdminAndAbove(req.role)) {
                return next();
            }
            // 2. Check if user owner has access to Team
            if (permissionRoles.includes(req.role)) {
                return next();
            }
            //3. Check if Organizer has access to Team
            // 4. Permission denied
            return apiResponse_1.ApiResponse.error(res, `Forbidden: You don't have proper permission to do this activity`, 403, { isAccessDenied: true });
        }
        catch (error) {
            return apiResponse_1.ApiResponse.error(res, 'Permission check failed', 500, { isError: true });
        }
    };
};
exports.CheckOwnerWithOrganiserPermission = CheckOwnerWithOrganiserPermission;
const CheckOwnerOnlyPermission = (role, permissionRoles) => {
    return (req, res, next) => {
        try {
            // 1. Super Admin and Admin bypass
            if (roles_helpers_1.RoleHelper.isAdminAndAbove(req.role)) {
                return next();
            }
            // 2. Check if owner has access to team
            if (permissionRoles.includes(req.role)) {
                return next();
            }
            // 3. Permission denied
            return apiResponse_1.ApiResponse.error(res, `Forbidden: You don't have proper permission to do this activity`, 403, { isAccessDenied: true });
        }
        catch (error) {
            return apiResponse_1.ApiResponse.error(res, 'Permission check failed', 500, { isError: true });
        }
    };
};
exports.CheckOwnerOnlyPermission = CheckOwnerOnlyPermission;
