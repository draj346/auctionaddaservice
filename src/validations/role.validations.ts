import Joi from "joi";
import { PlayerIdSchema } from "../types/player.types";

const withMeta = (schema: Joi.Schema, meta: Record<string, any>) => {
  return schema.meta({ __customMeta: meta });
};

export const playerIdSchema = Joi.object<PlayerIdSchema>({
  playerId: 
    Joi.number().integer().min(10001).required().messages({
      "number.base": "Player ID must be a number",
      "number.integer": "Player ID must be an integer",
      "number.min": "Player ID must be at least 10001",
      "any.required": "Player ID is required",
    }),
    // { isValidationFailed: true }
});

export const playerIdsSchema = Joi.object({
  playerIds: Joi.array()
    .items(
      Joi.number()
        .integer()
        .min(10001)
        .required()
        .messages({
          'number.base': 'Player ID must be a number',
          'number.integer': 'Player ID must be an integer',
          'number.min': 'Player ID must be at least 10001'
        })
    )
    .min(1)
    .required()
    .messages({
      'array.base': 'Player IDs must be an array',
      'array.min': 'At least one player ID is required',
      'any.required': 'Player IDs are required'
    })
});
