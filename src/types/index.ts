import { PlayerRole } from "../constants/roles.constants";

export interface RolePayload {
  name: PlayerRole;
}

export interface ErrorResponsePayload {
  isAccessDenied?: boolean;
  isError?: boolean;
}