"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveAuctionForAuctionSchema = exports.deleteFromWhislistSchema = exports.upsetWishlistSchema = exports.updatePlayerToCategorySchema = exports.JoinAuctionSchema = exports.updatePlayerToAuctionSchema = exports.getPlayerByCategoryIdSchema = exports.upsetCategorySchema = exports.removeOwnerFromTeamSchema = exports.assignOwnerToTeamSchema = exports.upsetTeamSchema = exports.upsetTransactionSchema = exports.updateCategorySchema = exports.auctionTeamIdSchema = exports.auctionFileIdSchema = exports.auctionCategoryIdSchema = exports.teamIdSchema = exports.auctionCodeSchema = exports.auctionSearchTextSchema = exports.auctionIdSchema = exports.upsetAuctionSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.upsetAuctionSchema = joi_1.default.object({
    auctionId: joi_1.default.number().required().allow(null),
    imageId: joi_1.default.number().required().allow(null),
    name: joi_1.default.string().trim().required(),
    season: joi_1.default.number().max(20).required().allow(null),
    state: joi_1.default.string().trim().required(),
    district: joi_1.default.string().trim().required(),
    startDate: joi_1.default.string()
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
    startTime: joi_1.default.string().trim().required().allow(null, ""),
    maxPlayerPerTeam: joi_1.default.number().max(30).required(),
    minPlayerPerTeam: joi_1.default.number().min(1).required().allow(null),
    pointPerTeam: joi_1.default.number().min(1).max(9999999999).required(),
    baseBid: joi_1.default.number().min(1).max(9999999).required(),
    baseIncreaseBy: joi_1.default.number().min(1).max(999999).required(),
    qrCodeId: joi_1.default.number().required().allow(null),
    isPaymentInCompanyAccount: joi_1.default.bool().required().allow(null),
    rule: joi_1.default.string().trim().required().allow(null, ""),
});
exports.auctionIdSchema = joi_1.default.object({
    auctionId: joi_1.default.number().integer().min(1).required().messages({
        "number.base": "Auction ID must be a number",
        "number.integer": "Auction ID must be an integer",
        "number.min": "Auction ID must be at least 1",
        "any.required": "Auction ID is required",
    }),
});
exports.auctionSearchTextSchema = joi_1.default.object({
    searchText: joi_1.default.string().trim().required(),
});
exports.auctionCodeSchema = joi_1.default.object({
    code: joi_1.default.string().trim().required(),
});
exports.teamIdSchema = joi_1.default.object({
    teamId: joi_1.default.number().integer().min(1).required().messages({
        "number.base": "Team ID must be a number",
        "number.integer": "Team ID must be an integer",
        "number.min": "Team ID must be at least 1",
        "any.required": "Team ID is required",
    }),
});
exports.auctionCategoryIdSchema = joi_1.default.object({
    categoryId: joi_1.default.number().min(1).required(),
    auctionId: joi_1.default.number().integer().min(1).required(),
});
exports.auctionFileIdSchema = joi_1.default.object({
    fileId: joi_1.default.number().integer().min(1).required(),
});
exports.auctionTeamIdSchema = joi_1.default.object({
    teamId: joi_1.default.number().min(1).required(),
    auctionId: joi_1.default.number().integer().min(1).required(),
});
exports.updateCategorySchema = joi_1.default.object({
    defCategoryDisplayOrderId: joi_1.default.number().min(1).required().allow(null),
    players_selection_rule: joi_1.default.string().valid("RANDOM", "MANUAL", "SEQUENCE").required().allow(null, ""),
    auctionId: joi_1.default.number().integer().min(1).required(),
});
exports.upsetTransactionSchema = joi_1.default.object({
    status: joi_1.default.string().valid("pending", "canceled", "denied", "completed").required().allow(null, ""),
    auctionId: joi_1.default.number().integer().min(1).required(),
    amount: joi_1.default.number().integer().min(1).required(),
    transactionId: joi_1.default.number().integer().min(1).required(),
});
exports.upsetTeamSchema = joi_1.default.object({
    teamId: joi_1.default.number().required().allow(null),
    name: joi_1.default.string().trim().required(),
    shortName: joi_1.default.string().trim().required(),
    shortcutKey: joi_1.default.string().max(1).trim().required(),
    image: joi_1.default.number().integer().required().allow(null),
});
exports.assignOwnerToTeamSchema = joi_1.default.object({
    teamId: joi_1.default.number().required().allow(null),
    auctionId: joi_1.default.number().integer().min(1).required(),
    ownerId: joi_1.default.number().integer().min(1).required(),
    tag: joi_1.default.string().valid("OWNER", "CO-OWNER").required(),
});
exports.removeOwnerFromTeamSchema = joi_1.default.object({
    teamId: joi_1.default.number().min(1).required(),
    ownerId: joi_1.default.number().integer().min(1).required(),
    auctionId: joi_1.default.number().integer().min(1).required(),
});
const incrementsSchema = joi_1.default.object({
    increment: joi_1.default.number().min(1).required(),
    after: joi_1.default.number().integer().min(0).required(),
});
exports.upsetCategorySchema = joi_1.default.object({
    categoryId: joi_1.default.number().required().allow(null),
    name: joi_1.default.string().trim().required(),
    maxPlayer: joi_1.default.number().max(1000).required().allow(null),
    minPlayer: joi_1.default.number().min(1).required().allow(null),
    baseBid: joi_1.default.number().min(1).max(999999999999).required().allow(null),
    reserveBid: joi_1.default.number().min(1).max(999999999999).required().allow(null),
    highestBid: joi_1.default.number().min(1).max(999999999999).required().allow(null),
    categoryHighestBid: joi_1.default.number().min(1).max(999999999999).required().allow(null),
    increments: joi_1.default.array().items(incrementsSchema).allow(null).empty(null).default([]),
});
exports.getPlayerByCategoryIdSchema = joi_1.default.object({
    auctionId: joi_1.default.number().min(1).required(),
    categoryId: joi_1.default.number().min(1).required(),
});
exports.updatePlayerToAuctionSchema = joi_1.default.object({
    auctionId: joi_1.default.number().min(1).required(),
    categoryId: joi_1.default.number().min(1).required().allow(null),
    playerIds: joi_1.default.array().items(joi_1.default.number().integer().min(1).required()),
    baseBid: joi_1.default.number().min(1).max(999999999999).required().allow(null),
    isApproved: joi_1.default.boolean().allow(null).optional(),
});
exports.JoinAuctionSchema = joi_1.default.object({
    auctionId: joi_1.default.number().min(1).required(),
    fileId: joi_1.default.number().min(1).required().allow(null),
});
exports.updatePlayerToCategorySchema = joi_1.default.object({
    auctionId: joi_1.default.number().min(1).required(),
    categoryId: joi_1.default.number().min(1).required().allow(null),
    playerIds: joi_1.default.array().items(joi_1.default.number().integer().min(1).required()),
});
exports.upsetWishlistSchema = joi_1.default.object({
    id: joi_1.default.number().required().allow(null),
    auctionId: joi_1.default.number().required(),
    teamId: joi_1.default.number().min(1).required(),
    playerId: joi_1.default.number().min(1).required(),
    tag: joi_1.default.string().valid("Captain", "Vice Captain", "Player").required(),
});
exports.deleteFromWhislistSchema = joi_1.default.object({
    playerId: joi_1.default.number().min(1).required(),
    teamId: joi_1.default.number().min(1).required(),
});
exports.approveAuctionForAuctionSchema = joi_1.default.object({
    playerIds: joi_1.default.array().items(joi_1.default.number().integer().min(1).required()).min(1).required(),
    auctionId: joi_1.default.number().min(1).required(),
});
