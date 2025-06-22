import Joi from "joi";
import { playerPaginationSchema } from "../types/player.types";

export const updateProfileSchema = Joi.object<playerPaginationSchema>({
  page: Joi.number().required().min(1),
  search: Joi.string().trim().allow('').alphanum().required(),
  owner: Joi.string().valid("all", "Yes", "No").required(),
  approved: Joi.string().valid("all", "Yes", "No").required(),
  sort: Joi.string().trim().allow('').required()
});