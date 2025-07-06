import Joi from "joi";
import { IUpdatePendingUpdate } from "../types/notification.types";

export const updatePendingActionSchema = Joi.object<IUpdatePendingUpdate>({
  id: Joi.number().integer().min(1).required().messages({
      "number.base": "Player ID must be a number",
      "number.integer": "Player ID must be an integer",
      "number.min": "Player ID must be at least 10001",
      "any.required": "Player ID is required",
    }),
  status: Joi.boolean().required(),
});

