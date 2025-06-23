"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    static success(res, data, statusCode = 200, message = 'Success') {
        res.status(statusCode).json({
            success: true,
            message,
            data
        });
    }
    static error(res, message = 'Internal Server Error', statusCode = 500, error, type) {
        res.status(statusCode).json({
            success: false,
            message,
            error: error?.message || error,
            ...(type && typeof type === 'object' ? type : {})
        });
    }
}
exports.ApiResponse = ApiResponse;
