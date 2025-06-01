import { Request, Response, NextFunction } from 'express';
import { AnySchema } from 'joi';
import { ApiResponse } from '../utils/apiResponse';

export const validate = (schema: AnySchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            allowUnknown: false
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.context?.key,
                message: detail.message
            }));
            return ApiResponse.error(res, 'Validation failed', 400, errors);
        }

        next();
    };
};