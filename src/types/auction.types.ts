export interface ICreateAuction {
  auctionId: number | null;
  imageId: number;
  name: string;
  state: string;
  district: string;
  startDate: Date;
  startTime: string;
  maxPlayerPerTeam: number;
  minPlayerPerTeam: number;
  playerId: number;
  code: string;
  pointPerTeam: number;
  baseBid: number;
  baseIncreaseBy: number;
}

export interface IAuctionAttributesIdsSchema {
  auctionId?: number;
  teamId?: number;
  categoryId?: number;
  ownerId?: number;
  playerId?: number;
  searchText?: string;
}

export interface IAuctionDetails {
  auctionId?: number;
  imageId: number;
  path?: string;
  name: string;
  state?: string;
  district: string;
  paymentStatus: boolean;
  startDate: Date;
  startTime: string;
  maxPlayerPerTeam: number;
  minPlayerPerTeam?: number;
  code: string;
  isLive: boolean;
  pointPerTeam: number;
  baseBid: number;
  baseIncreaseBy: number;
  isActive?: boolean;
}

export interface ICategoryRule {
  defCategoryDisplayOrderId: number;
  players_selection_rule: "RANDOM" | "MANUAL" | "SEQUENCE";
  auctionId: number;
}

export interface ITransaction {
  auctionId: number;
  amount: number;
  transactionId: number;
  status: "pending" | "canceled" | "denied" | "completed";
}

export interface ICreateTeam {
  teamId: number | null;
  name: string;
  shortName: string;
  image: number;
  shortcutKey: string;
  auctionId: number;
}

export interface ITeamDetails {
  teamId: number;
  name: string;
  shortName: string;
  image: number;
  path: string;
  shortcutKey: string;
}

export interface IAssignOwner {
  auctionId: number;
  teamId: number;
  ownerId: number;
  tag: "OWNER" | "CO-OWNER";
}

export type IIncrements = {
  increment: number;
  after: number;
};

export interface ICreateCategory {
  categoryId: number | null;
  auctionId: number;
  name: string;
  maxPlayer: number;
  minPlayer: number;
  baseBid: number;
  reserveBid: number;
  highestBid: number;
  categoryHighestBid: number;
  increments: IIncrements[];
}

export interface ICategoryDetails {
  categoryId: number;
  name: string;
  maxPlayer: number;
  minPlayer: number;
  baseBid: number;
  reserveBid: number;
  highestBid: number;
  categoryHighestBid: number;
  increments: IIncrements[];
}

export type IManageAuctionOperation = "ASSIGN_AUCTION" | "ASSIGN_CATEGORY" | "REMOVE_CATEGORY" | "REMOVE_AUCTION";

export interface IManageAuction {
  operation: IManageAuctionOperation;
  auctionId: number;
  categoryId: number;
  playerIds: number[];
}

export interface IAssignWishlist {
  id: number | null;
  auctionId: number;
  teamId: number;
  playerId: number;
  tag: "Captain" | "Vice Captain" | "Player";
}

export interface IAuctionStoreProcedureResponse {
  status: boolean;
  isLive?: boolean;
  isAccessDenied?: boolean;
}

export interface IAuctionErrors {
    isAccessDenied?: boolean;
    isFreeLimitReached?: boolean;
    isError?: boolean;
    isNotFound?: boolean;
    isValidationFailed?: boolean;
}