import { PlayerRole } from "../constants/roles.constants";

declare global {
  namespace Express {
    interface Request {
      userId: number;
      role: PlayerRole;
      name: string;
      mobile: number;
      email: string;
    }
  }
}

export interface AuthTokenPayload {
  playerId: number;
  role: PlayerRole
  name: string;
  mobile: number;
  email: string;
}