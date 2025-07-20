export interface ICreateAuction {
  auctionId: number | null;
  imageId: number;
  name: string;
  state: string;
  district: string;
  startDate: string;
  startTime: string;
  maxPlayerPerTeam: number;
  minPlayerPerTeam: number;
  playerId: number;
  code: string;
  pointPerTeam: number;
  baseBid: number;
  baseIncreaseBy: number;
  qrCodeId: number;
  isPaymentInCompanyAccount: boolean;
  rule: string;
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
  imageId: number | null;
  imagePath?: string;
  name: string;
  state?: string;
  district: string;
  paymentStatus: boolean;
  startDate: string;
  startTime: string;
  maxPlayerPerTeam: number;
  minPlayerPerTeam?: number;
  code: string;
  isLive: boolean;
  pointPerTeam: number;
  baseBid: number;
  baseIncreaseBy: number;
  isActive?: boolean;
  qrCodeId: number | null;
  qrCodePath?: string;
  isPaymentInCompanyAccount: boolean;
  rule: string;
  playerId?: number;
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
  isNotFound?: boolean;
  isLocked?: boolean;
  imagePath?: string;
  qrCodePath?: string;
  playerId?: number;
  name?: string;
  state?: string;
  code?: string;
}

export interface IAuctionErrors {
    isAccessDenied?: boolean;
    isFreeLimitReached?: boolean;
    isError?: boolean;
    isNotFound?: boolean;
    isValidationFailed?: boolean;
}

export interface IAuctionPlayerIdWithName {
  playerId: number;
  name: string
  code: string;
}