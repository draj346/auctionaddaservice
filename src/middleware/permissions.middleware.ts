import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { PlayerRole, ROLES } from '../constants/roles.constants';

export const CheckPermission = (role: PlayerRole, permissionRoles: [PlayerRole]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // 1. Super Admin bypass
            if (role === ROLES.SUPER_ADMIN) {
                return next();
            }
            
            // 2. Check if user role is in permissionRoles
            if (permissionRoles.includes(role)) {
                return next();
            }
            
            // 3. Permission denied
            return ApiResponse.error(
                res,
               `Forbidden: You don't have proper permission to do this activity`,
                403
            );
        } catch (error) {
            return ApiResponse.error(res, 'Permission check failed', 500);
        }
    };
};

export const CheckOrganiserPermission = (role: PlayerRole, permissionRoles: [PlayerRole]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // 1. Super Admin bypass
            if (role === ROLES.SUPER_ADMIN) {
                return next();
            }
            
            // 2. Check if user role is in permissionRoles
            if (permissionRoles.includes(role)) {
                return next();
            }
            
            // 3. Permission denied
            return ApiResponse.error(
                res,
               `Forbidden: You don't have proper permission to do this activity`,
                403
            );
        } catch (error) {
            return ApiResponse.error(res, 'Permission check failed', 500);
        }
    };
};

export const CheckOwnerWithOrganiserPermission = (role: PlayerRole, permissionRoles: [PlayerRole]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // 1. Super Admin bypass
            if (role === ROLES.SUPER_ADMIN) {
                return next();
            }
            
            // 2. Check if user role is in permissionRoles
            if (permissionRoles.includes(role)) {
                return next();
            }
            
            // 3. Permission denied
            return ApiResponse.error(
                res,
               `Forbidden: You don't have proper permission to do this activity`,
                403
            );
        } catch (error) {
            return ApiResponse.error(res, 'Permission check failed', 500);
        }
    };
};


export const CheckOwnerOnlyPermission = (role: PlayerRole, permissionRoles: [PlayerRole]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // 1. Super Admin bypass
            if (role === ROLES.SUPER_ADMIN) {
                return next();
            }
            
            // 2. Check if user role is in permissionRoles
            if (permissionRoles.includes(role)) {
                return next();
            }
            
            // 3. Permission denied
            return ApiResponse.error(
                res,
               `Forbidden: You don't have proper permission to do this activity`,
                403
            );
        } catch (error) {
            return ApiResponse.error(res, 'Permission check failed', 500);
        }
    };
};