import { PlayerRole } from "../constants/roles.constants";

declare global {
  namespace Express {
    interface Request {
      userId: number;
      role: PlayerRole;
    }
  }
}

export interface AuthTokenPayload {
  playerId: number;
  role: PlayerRole
}
