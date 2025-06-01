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
  isSubmitted?: boolean;
  modifiedAt?: Date;
  createdAt?: Date;
  isNonPlayer?: boolean;
  isOwner?: boolean;
  isAdmin?: boolean;
  password?: string;
}

export interface InitialRegistrationData {
  name: string;
  mobile: string;
  email?: string;
}

export interface CompleteRegistrationData {
  playerId: number;
  jerseyNumber: number;
  tShirtSize: string;
  lowerSize: string;
  hasCricheroesProfile: boolean;
  isPaidPlayer: boolean;
  pricePerMatch: number;
  willJoinAnyOwner: boolean;
  isSubmitted: boolean;
  isNonPlayer: boolean;
  isOwner: boolean;
  isAdmin: boolean;
}

export interface RegistrationProfileImage {
  image: string;
  playerId: number;
}
