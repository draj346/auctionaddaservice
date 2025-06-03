import Joi from 'joi';
import { 
  InitialRegistrationData, 
  UpdateProfileSchemaData, 
} from '../types/player.types';

export const initialRegistrationSchema = Joi.object<InitialRegistrationData>({
  name: Joi.string().required(),
  mobile: Joi.string().required(),
  email: Joi.string().email().allow('').required()
});

export const updateProfileSchema = Joi.object<UpdateProfileSchemaData>({
  playerId: Joi.number().required(),
  jerseyNumber: Joi.number().allow('').allow(null).optional(),
  tShirtSize: Joi.string().allow('').allow(null).optional(),
  lowerSize: Joi.string().allow('').allow(null).optional(),
  hasCricheroesProfile: Joi.boolean().allow('').allow(null).optional(),
  isPaidPlayer: Joi.boolean().allow('').allow(null).optional(),
  image: Joi.number().allow('').allow(null).optional(),
  pricePerMatch: Joi.number().allow('').allow(null).optional(),
  willJoinAnyOwner: Joi.boolean().allow('').allow(null).optional(),
  isSubmitted: Joi.boolean().allow('').optional(),
  isNonPlayer: Joi.boolean().allow('').optional(),
  isOwner: Joi.boolean().allow('').optional(),
  isAdmin: Joi.boolean().allow('').optional()
});
