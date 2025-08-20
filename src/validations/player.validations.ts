import Joi from "joi";
import { AuctionPlayerPaginationSchema, OwnerPaginationSchema, PlayerPaginationSchema } from "../types/player.types";

export const playerPaginationSchema = Joi.object<PlayerPaginationSchema>({
  page: Joi.number().required().min(1),
  search: Joi.string().trim().allow('').pattern(/^[a-zA-Z0-9\s]*$/).required(),
  approved: Joi.string().valid("all", "Yes", "No").required(),
  active: Joi.string().valid("all", "Yes", "No").required(),
  sort: Joi.string().trim().allow('').required()
});

export const adminsPaginationSchema = Joi.object<PlayerPaginationSchema>({
  page: Joi.number().required().min(1),
  search: Joi.string().trim().allow('').pattern(/^[a-zA-Z0-9\s]*$/).required(),
});

export const ownerPaginationSchema = Joi.object<OwnerPaginationSchema>({
  search: Joi.string().trim().allow('').pattern(/^[a-zA-Z0-9\s]*$/).optional(),
});

export const auctionPlayerPaginationSchema = Joi.object<AuctionPlayerPaginationSchema>({
  page: Joi.number().required().min(1),
  search: Joi.string().trim().allow('').pattern(/^[a-zA-Z0-9\s]*$/).required(),
});
