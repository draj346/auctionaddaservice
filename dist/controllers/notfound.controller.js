"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const notFoundHandler = (req, res) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        ip: req.ip,
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        query: req.query,
        body: req.body
    };
    // Log full details (use proper logger in production)
    console.warn('404 Not Found:', logEntry);
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        error: {
            code: 404,
        }
    });
};
exports.notFoundHandler = notFoundHandler;
