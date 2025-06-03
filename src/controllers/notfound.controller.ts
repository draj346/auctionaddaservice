import { Request, Response } from "express";

export const notFoundHandler = (req: Request, res: Response) => {
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