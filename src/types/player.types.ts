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
  state?: string;
  district?: string;
}

export interface UpdateProfileSchemaData {
  state?: string;
  district?: string;
  playerId: number;
  image: number;
  jerseyNumber: number;
  tShirtSize: string;
  lowerSize: string;
  hasCricheroesProfile: boolean;
  isPaidPlayer: boolean;
  pricePerMatch: number;
  willJoinAnyOwner: boolean;
}

export interface AddProfileSchemaData {
  name: string;
  mobile: string;
  email: string;
  state: string;
  district: string;
  jerseyNumber: number;
  tShirtSize: string;
  lowerSize: string;
  hasCricheroesProfile: boolean;
  isPaidPlayer: boolean;
  pricePerMatch: number;
  image: number;
  willJoinAnyOwner: boolean;
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
export interface PlayerIdSchema {
   playerId: number;
}

export interface PlayerIdsSchema {
   playerIds: number[];
}

export interface AddProfileExcelSchema {
  'Full Name': string; 
  'Mobile': string;
  'Email': string;
  'State': string;
  'District': string;
  'Jersey Number': number;
  'T-Shirt Size': string;
  'Lower Size': string;
  'Has Cricheroes Profile': boolean;
  'Is Paid Player': boolean;
  'Price Per Match': number;
  'Will Join Any Owner': boolean;
}

export interface PlayerPaginationSchema {
  page: number;
  search: string;
  approved: string;
  sort: string;
  active: string;
}