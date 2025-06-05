export interface Player {
  playerId: number;
  name: string;
  mobile: string;
  email?: string | null;
  jerseyNumber?: number;
  tShirtSize?: string;
  lowerSize?: string;
  hasCricheroesProfile?: boolean;
  isPaidPlayer?: boolean;
  pricePerMatch?: number;
  willJoinAnyOwner?: boolean;
  image?: string;
  isSubmitted: boolean;
  isApproved: boolean;
  isActive: boolean;
  isNonPlayer: boolean;
}

export interface InitialRegistrationData {
  name: string;
  mobile: string;
  email?: string;
}

export interface UpdateProfileSchemaData {
  playerId: number;
  jerseyNumber: number;
  tShirtSize: string;
  lowerSize: string;
  hasCricheroesProfile: boolean;
  isPaidPlayer: boolean;
  pricePerMatch: number;
  image: number;
  willJoinAnyOwner: boolean;
  isSubmitted: boolean;
}

export interface PlayerExistsSchema {
  playerId?: number;
  isRegistered?: boolean;
  duplicateEmail?: boolean;
  duplicateMobile?: boolean;
}

export interface PlayerBaseSchema {
  playerId: number;
  name: string;
  mobile: string;
  email?: string | null;
}