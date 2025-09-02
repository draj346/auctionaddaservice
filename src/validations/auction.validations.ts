import Joi from "joi";
import {
  IApprovePlayerForAuction,
  IAssignOwner,
  IAssignWishlist,
  IAuctionAttributesIdsSchema,
  ICategoryRule,
  ICreateAuction,
  ICreateCategory,
  ICreateTeam,
  IIncrements,
  IManageAuction,
  IManageTeam,
  IPlayerOrderForAuction,
  ITransaction,
  IUnsoldPlayerForAuction,
} from "../types/auction.types";

export const upsetAuctionSchema = Joi.object<ICreateAuction>({
  auctionId: Joi.number().required().allow(null),
  imageId: Joi.number().required().allow(null),
  name: Joi.string().trim().required(),
  season: Joi.number().max(20).required().allow(null),
  state: Joi.string().trim().required(),
  district: Joi.string().trim().required(),
  startDate: Joi.string()
    .pattern(/^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/)
    .required()
    .custom((value, helpers) => {
      const [day, month, year] = value.split("-").map(Number);
      const date = new Date(year, month - 1, day);

      if (date.getDate() !== day || date.getMonth() + 1 !== month || date.getFullYear() !== year) {
        return helpers.error("date.invalid");
      }
      return date;
    }, "Date Validation"),
  startTime: Joi.string().trim().required().allow(null, ""),
  maxPlayerPerTeam: Joi.number().max(30).required(),
  minPlayerPerTeam: Joi.number().min(2).required().allow(null),
  pointPerTeam: Joi.number().min(1).max(9999999999).required(),
  baseBid: Joi.number().min(1).max(9999999).required(),
  baseIncreaseBy: Joi.number().min(1).max(999999).required(),
  qrCodeId: Joi.number().required().allow(null),
  isPaymentInCompanyAccount: Joi.bool().required().allow(null),
  rule: Joi.string().trim().required().allow(null, ""),
});

export const auctionIdSchema = Joi.object<IAuctionAttributesIdsSchema>({
  auctionId: Joi.number().integer().min(1).required().messages({
    "number.base": "Auction ID must be a number",
    "number.integer": "Auction ID must be an integer",
    "number.min": "Auction ID must be at least 1",
    "any.required": "Auction ID is required",
  }),
});

export const auctionSearchTextSchema = Joi.object<IAuctionAttributesIdsSchema>({
  searchText: Joi.string().trim().required(),
});

export const auctionCodeSchema = Joi.object<IAuctionAttributesIdsSchema>({
  code: Joi.string().trim().required(),
});

export const teamIdSchema = Joi.object<IAuctionAttributesIdsSchema>({
  teamId: Joi.number().integer().min(1).required().messages({
    "number.base": "Team ID must be a number",
    "number.integer": "Team ID must be an integer",
    "number.min": "Team ID must be at least 1",
    "any.required": "Team ID is required",
  }),
});

export const auctionCategoryIdSchema = Joi.object<IAuctionAttributesIdsSchema>({
  categoryId: Joi.number().min(1).required(),
  auctionId: Joi.number().integer().min(1).required(),
});

export const auctionFileIdSchema = Joi.object<IAuctionAttributesIdsSchema>({
  fileId: Joi.number().integer().min(1).required(),
});

export const auctionTeamIdSchema = Joi.object<IAuctionAttributesIdsSchema>({
  teamId: Joi.number().min(1).required(),
  auctionId: Joi.number().integer().min(1).required(),
});

export const updateCategorySchema = Joi.object<ICategoryRule>({
  defCategoryDisplayOrderId: Joi.number().min(1).required().allow(null),
  players_selection_rule: Joi.string().valid("RANDOM", "MANUAL", "SEQUENCE").required().allow(null, ""),
  auctionId: Joi.number().integer().min(1).required(),
});

export const upsetTransactionSchema = Joi.object<ITransaction>({
  status: Joi.string().valid("pending", "canceled", "denied", "completed").required().allow(null, ""),
  auctionId: Joi.number().integer().min(1).required(),
  amount: Joi.number().integer().min(1).required(),
  transactionId: Joi.number().integer().min(1).required(),
});

export const upsetTeamSchema = Joi.object<ICreateTeam>({
  teamId: Joi.number().required().allow(null),
  name: Joi.string().trim().required(),
  shortName: Joi.string().max(2).trim().required(),
  shortcutKey: Joi.string().max(1).trim().required(),
  image: Joi.number().integer().required().allow(null),
});

export const assignOwnerToTeamSchema = Joi.object<IAssignOwner>({
  teamId: Joi.number().required().allow(null),
  auctionId: Joi.number().integer().min(1).required(),
  ownerId: Joi.number().integer().min(1).required(),
  tag: Joi.string().valid("OWNER", "CO-OWNER").required(),
});

export const removeOwnerFromTeamSchema = Joi.object<IAuctionAttributesIdsSchema>({
  teamId: Joi.number().min(1).required(),
  ownerId: Joi.number().integer().min(1).required(),
  auctionId: Joi.number().integer().min(1).required(),
});

const incrementsSchema = Joi.object<IIncrements>({
  increment: Joi.number().min(1).required(),
  after: Joi.number().integer().min(0).required(),
});

export const upsetCategorySchema = Joi.object<ICreateCategory>({
  categoryId: Joi.number().required().allow(null),
  name: Joi.string().trim().required(),
  maxPlayer: Joi.number().max(1000).required().allow(null),
  minPlayer: Joi.number().min(2).required().allow(null),
  baseBid: Joi.number().min(1).max(999999999999).required().allow(null),
  reserveBid: Joi.number().min(1).max(999999999999).required().allow(null),
  highestBid: Joi.number().min(1).max(999999999999).required().allow(null),
  categoryHighestBid: Joi.number().min(1).max(999999999999).required().allow(null),
  increments: Joi.array().items(incrementsSchema).allow(null).empty(null).default([]),
});

export const getPlayerByCategoryIdSchema = Joi.object<IAuctionAttributesIdsSchema>({
  auctionId: Joi.number().min(1).required(),
  categoryId: Joi.number().min(1).required(),
});

export const updatePlayerToAuctionSchema = Joi.object<IManageAuction>({
  auctionId: Joi.number().min(1).required(),
  categoryId: Joi.number().min(1).required().allow(null),
  playerIds: Joi.array().items(Joi.number().integer().min(1).required()),
  baseBid: Joi.number().min(1).max(999999999999).required().allow(null),
  isApproved: Joi.boolean().allow(null).optional(),
});

export const JoinAuctionSchema = Joi.object<IManageAuction>({
  auctionId: Joi.number().min(1).required(),
  fileId: Joi.number().min(1).required().allow(null),
});

export const updatePlayerToCategorySchema = Joi.object<IManageAuction>({
  auctionId: Joi.number().min(1).required(),
  categoryId: Joi.number().min(1).required().allow(null),
  playerIds: Joi.array().items(Joi.number().integer().min(1).required()),
});

export const upsetWishlistSchema = Joi.object<IAssignWishlist>({
  id: Joi.number().required().allow(null),
  auctionId: Joi.number().required(),
  teamId: Joi.number().min(1).required(),
  playerId: Joi.number().min(1).required(),
  tag: Joi.string().valid("Captain", "Vice Captain", "Player").required(),
});

export const deleteFromWhislistSchema = Joi.object<IAuctionAttributesIdsSchema>({
  playerId: Joi.number().min(1).required(),
  teamId: Joi.number().min(1).required(),
});

export const approveAuctionForAuctionSchema = Joi.object<IApprovePlayerForAuction>({
  playerIds: Joi.array().items(Joi.number().integer().min(1).required()).min(1).required(),
  auctionId: Joi.number().min(1).required(),
});

export const auctionAndPlayerIdSchema = Joi.object<IUnsoldPlayerForAuction>({
  playerId: Joi.number().min(1).required(),
  auctionId: Joi.number().min(1).required(),
  status: Joi.string().valid("unsold", "available").required(),
});

export const playerOrderSchema = Joi.object<IPlayerOrderForAuction>({
  auctionId: Joi.number().min(1).required(),
  type: Joi.string().valid('random', 'manual', 'sequence').required(),
});

export const updatePlayerToTeamSchema = Joi.object<IManageTeam>({
  auctionId: Joi.number().min(1).required(),
  teamId: Joi.number().min(1).required(),
  playerIds: Joi.array().items(Joi.number().integer().min(1).required()),
  price: Joi.number().min(1).max(999999999999).required().allow(null),
});
