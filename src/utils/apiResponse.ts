import { Response } from 'express';

export class ApiResponse {
    static success(
        res: Response, 
        data: any, 
        statusCode: number = 200, 
        message: string = 'Success'
    ) {
        res.status(statusCode).json({
            success: true,
            message,
            data
        });
    }

    static error(
        res: Response, 
        message: string = 'Internal Server Error', 
        statusCode: number = 500,
        error?: any,
        type?:any
    ) {
        res.status(statusCode).json({
            success: false,
            message,
            error: error?.message || error,
            ...(type && typeof type === 'object' ? type : {})
        });
    }
}