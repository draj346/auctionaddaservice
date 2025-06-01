import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';
import { ApiResponse } from '../utils/apiResponse';
import { AuthService } from '../services/auth.service';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      player?: { playerId: number };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return ApiResponse.error(res, 'Unauthorized: No token provided', 401);
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { playerId: number };
    const isValidUser = await AuthService.isValidUser(decoded.playerId);
    if (!isValidUser) {
       return ApiResponse.error(res, 'Unauthorized: Invalid token', 401);
    }
    req.player = { playerId: decoded.playerId }; // Type-safe assignment
    next();
  } catch (err) {
    return ApiResponse.error(res, 'Unauthorized: Invalid token', 401);
  }
};