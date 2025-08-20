export type PLAYER_ROLES = 'Top-order Batsman'| 'Middle-order Batsman'| 'Bowler'| 'All-rounder'| 'Lower-order Batsman'| 'Opening Batsman'| 'None';
export type BATTING_STYLES = 'Left-hand Batsman'| 'Right-hand Batsman';
export type BOWLING_STYLES = 'Right-arm fast'| 'Right-arm medium'| 'Left-arm fast'| 'Left-arm medium'| 'Slow left-arm orthodox'| 'Slow left-arm chinaman' | ' Right-arm Off Break'| 'Right-arm Leg Break';


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
  playerRole?: PLAYER_ROLES;
  battingStyle?: BATTING_STYLES;
  bowlingStyle?: BOWLING_STYLES;
  description?: string;
  status?: boolean;
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
  playerRole?: PLAYER_ROLES;
  battingStyle?: BATTING_STYLES;
  bowlingStyle?: BOWLING_STYLES;
  description?: string
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
  playerRole?: PLAYER_ROLES;
  battingStyle?: BATTING_STYLES;
  bowlingStyle?: BOWLING_STYLES;
  description?: string
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
  'Player Role': PLAYER_ROLES;
  'Batting Style': BATTING_STYLES;
  'Bowling Style': BOWLING_STYLES;
  'Description': string
}

export interface PlayerPaginationSchema {
  page: number;
  search: string;
  approved: string;
  sort: string;
  active: string;
}

export interface OwnerPaginationSchema {
  search: string;
}

export interface AuctionPlayerPaginationSchema {
  page: number;
  search: string;
  auctionId: number;
}