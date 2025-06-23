"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const validate = (schema, check = "body") => {
    return (req, res, next) => {
        const { error } = schema.validate(req[check], {
            abortEarly: false,
            allowUnknown: false,
        });
        if (error) {
            const schemaDescription = schema.describe();
            const errors = error.details.map((detail) => {
                const response = {
                    field: detail.context?.key,
                    message: detail.message
                };
                if (detail.path && detail.path.length > 0) {
                    const path = detail.path.join(".");
                    const fieldSchema = getSchemaAtPath(schemaDescription, path);
                    if (fieldSchema && fieldSchema.metas) {
                        for (const meta of fieldSchema.metas) {
                            if (meta.__customMeta) {
                                Object.assign(response, meta.__customMeta);
                            }
                        }
                    }
                }
                return response;
            });
            return apiResponse_1.ApiResponse.error(res, "Validation failed", 400, errors, { isValidationFailed: true });
        }
        next();
    };
};
exports.validate = validate;
function getSchemaAtPath(schema, path) {
    const parts = path.split(".");
    let current = schema;
    for (const part of parts) {
        if (current.keys && current.keys[part]) {
            current = current.keys[part];
        }
        else if (current.items && current.items[0]) {
            current = current.items[0];
        }
        else {
            return null;
        }
    }
    return current;
}
