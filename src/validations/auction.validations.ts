import Joi from "joi";
import { IAssignOwner, IAssignWishlist, IAuctionAttributesIdsSchema, ICategoryRule, ICreateAuction, ICreateCategory, ICreateTeam, IIncrements, IManageAuction, ITransaction } from "../types/auction.types";

export const upsetAuctionSchema = Joi.object<ICreateAuction>({
  auctionId: Joi.number().required().allow(null),
  imageId: Joi.number().required().allow(null),
  name: Joi.string().trim().required(),
  state: Joi.string().trim().required(),
  district: Joi.string().trim().required(),
  startDate: Joi.string()
    .pattern(/^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/)
    .required()
    .custom((value, helpers) => {
      const [day, month, year] = value.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      if (
        date.getDate() !== day ||
        date.getMonth() + 1 !== month ||
        date.getFullYear() !== year
      ) {
        return helpers.error('date.invalid');
      }
      return date;
    }, 'Date Validation'),
  startTime: Joi.string().trim().required().allow(null, ''),
  maxPlayerPerTeam: Joi.number().max(30).required(),
  minPlayerPerTeam: Joi.number().min(1).required().allow(null),
  pointPerTeam: Joi.number().min(1).max(9999999999).required(),
  baseBid: Joi.number().min(1).max(9999999).required(),
  baseIncreaseBy: Joi.number().min(1).max(999999).required(),
  qrCodeId: Joi.number().required().allow(null),
  isPaymentInCompanyAccount: Joi.bool().required().allow(null),
  rule: Joi.string().trim().required().allow(null, ''),
});

export const auctionIdSchema = Joi.object<IAuctionAttributesIdsSchema>({
  auctionId: 
    Joi.number().integer().min(1).required().messages({
      "number.base": "Auction ID must be a number",
      "number.integer": "Auction ID must be an integer",
      "number.min": "Auction ID must be at least 1",
      "any.required": "Auction ID is required",
    }),
});

export const auctionSearchTextSchema = Joi.object<IAuctionAttributesIdsSchema>({
  searchText: Joi.string().trim().required(),
});


export const teamIdSchema = Joi.object<IAuctionAttributesIdsSchema>({
  teamId: 
    Joi.number().integer().min(1).required().messages({
      "number.base": "Team ID must be a number",
      "number.integer": "Team ID must be an integer",
      "number.min": "Team ID must be at least 1",
      "any.required": "Team ID is required",
    }),
});

export const categoryIdSchema = Joi.object<IAuctionAttributesIdsSchema>({
  categoryId: Joi.number().min(1).required(),
});


export const updateCategorySchema = Joi.object<ICategoryRule>({
  defCategoryDisplayOrderId: Joi.number().min(1).required().allow(null),
  players_selection_rule: Joi.string().valid("RANDOM", "MANUAL", "SEQUENCE").required().allow(null, ''),
  auctionId: Joi.number().integer().min(1).required()
});

export const upsetTransactionSchema = Joi.object<ITransaction>({
  status: Joi.string().valid("pending", "canceled", "denied", "completed").required().allow(null, ''),
  auctionId: Joi.number().integer().min(1).required(),
  amount: Joi.number().integer().min(1).required(),
  transactionId: Joi.number().integer().min(1).required(),
});

export const upsetTeamSchema = Joi.object<ICreateTeam>({
  teamId: Joi.number().required().allow(null),
  name: Joi.string().trim().required(),
  shortName: Joi.string().trim().required(),
  shortcutKey: Joi.string().max(1).trim().required(),
  image: Joi.number().integer().required().allow(null),
  auctionId: Joi.number().integer().min(1).required(),
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
});

const incrementsSchema = Joi.object<IIncrements>({
  increment: Joi.number().min(1).required(),
  after: Joi.number().integer().min(0).required(),
});

export const upsetCategorySchema = Joi.object<ICreateCategory>({
  categoryId: Joi.number().required().allow(null),
  auctionId: Joi.number().required(),
  name: Joi.string().trim().required(),
  maxPlayer: Joi.number().max(30).required(),
  minPlayer: Joi.number().min(1).required(),
  baseBid: Joi.number().min(1).max(9999999).required(),
  reserveBid: Joi.number().min(1).max(9999999999).required(),
  highestBid: Joi.number().min(1).max(999999).required(),
  categoryHighestBid: Joi.number().min(1).max(999999).required(),
  increments: Joi.array()
    .items(incrementsSchema)
    .allow(null)
    .empty(null)
    .default([])
});


export const getPlayerByCategoryIdSchema = Joi.object<IAuctionAttributesIdsSchema>({
  auctionId: Joi.number().min(1).required(),
  categoryId: Joi.number().min(1).required(),
});

export const updatePlayerToAuctionSchema = Joi.object<IManageAuction>({
  operation: Joi.string()
    .valid("ASSIGN_AUCTION", "ASSIGN_CATEGORY", "REMOVE_CATEGORY", "REMOVE_AUCTION")
    .required(),
    
  auctionId: Joi.number().min(1).required(),
  
  categoryId: Joi.number().min(1)
    .when('operation', {
      is: Joi.valid("ASSIGN_AUCTION", "REMOVE_AUCTION"),
      then: Joi.forbidden(),
      otherwise: Joi.required()
    }),
    
  playerIds: Joi.array()
    .items(Joi.number().integer().min(1).required())
    .when('operation', {
      is: "REMOVE_AUCTION",
      then: Joi.forbidden(),
      otherwise: Joi.required()
    })
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
