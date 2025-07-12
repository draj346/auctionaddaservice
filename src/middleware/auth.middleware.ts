import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import { ApiResponse } from "../utils/apiResponse";
import { AuthService } from "../services/auth.service";
import { AuthTokenPayload } from "../types/request.types";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return ApiResponse.error(res, "Unauthorized: No token provided", 401);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    const userInfo = await AuthService.isValidLoggedInUser(decoded.playerId);
    if (!userInfo) {
      return ApiResponse.error(res, "User not found", 401);
    }
    
    req.userId = decoded.playerId;
    req.role = decoded.role;
    req.email = decoded.email;
    req.mobile = decoded.mobile;
    req.name = decoded.name;
    
    next();
  } catch (err) {
    return ApiResponse.error(res, "Unauthorized: Invalid token", 401);
  }
};
