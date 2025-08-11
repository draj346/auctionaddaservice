import { PlayerRole } from "../constants/roles.constants";

export interface RolePayload {
  name: PlayerRole;
}

export interface ErrorResponsePayload {
  isAccessDenied?: boolean;
  isError?: boolean;
}

export interface IBanner {
  id: number;
  heading: string;
  description: string;
  image: string;
}

export interface IDiscount {
  description: string;
}

export interface IYoutube {
  videoId: string;
}