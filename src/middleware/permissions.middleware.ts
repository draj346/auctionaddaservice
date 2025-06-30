import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { PlayerRole, ROLES } from '../constants/roles.constants';
import { RoleHelper } from '../helpers/roles.helpers';

export const CheckPermission = (permissionRoles: PlayerRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // 1. Super Admin bypass
            if (RoleHelper.isSuperAdmin(req.role)) {
                return next();
            }
            
            // 2. Check if user role is in permissionRoles
            if (permissionRoles.includes(req.role)) {
                return next();
            }
            
            // 3. Permission denied
            return ApiResponse.error(
                res,
               `Forbidden: You don't have proper permission to do this activity`,
                403,
                { isAccessDenied: true }
            );
        } catch (error) {
            return ApiResponse.error(res, 'Permission check failed', 500, { isError: true });
        }
    };
};

export const CheckOrganiserPermission = (role: PlayerRole, permissionRoles: PlayerRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // 1. Super Admin and Admin bypass
            if (RoleHelper.isAdminAndAbove(req.role)) {
                return next();
            }
            
            // 2. Check if user has access to auction
            if (permissionRoles.includes(req.role)) {
                return next();
            }
            
            // 3. Permission denied
            return ApiResponse.error(
                res,
               `Forbidden: You don't have proper permission to do this activity`,
                403,
                { isAccessDenied: true }
            );
        } catch (error) {
            return ApiResponse.error(res, 'Permission check failed', 500, { isError: true });
        }
    };
};

export const CheckOwnerWithOrganiserPermission = (role: PlayerRole, permissionRoles: PlayerRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // 1. Super Admin and Admin bypass
            if (RoleHelper.isAdminAndAbove(req.role)) {
                return next();
            }
            
            // 2. Check if user owner has access to Team
            if (permissionRoles.includes(req.role)) {
                return next();
            }

            //3. Check if Organizer has access to Team
            
            // 4. Permission denied
            return ApiResponse.error(
                res,
               `Forbidden: You don't have proper permission to do this activity`,
                403,
                { isAccessDenied: true }
            );
        } catch (error) {
            return ApiResponse.error(res, 'Permission check failed', 500, { isError: true });
        }
    };
};

export const CheckOwnerOnlyPermission = (role: PlayerRole, permissionRoles: PlayerRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // 1. Super Admin and Admin bypass
            if (RoleHelper.isAdminAndAbove(req.role)) {
                return next();
            }
            
            // 2. Check if owner has access to team
            if (permissionRoles.includes(req.role)) {
                return next();
            }
            
            // 3. Permission denied
            return ApiResponse.error(
                res,
               `Forbidden: You don't have proper permission to do this activity`,
                403,
                { isAccessDenied: true }
            );
        } catch (error) {
            return ApiResponse.error(res, 'Permission check failed', 500, { isError: true });
        }
    };
};