import Joi from 'joi';
import { 
  InitialRegistrationData, 
  UpdateProfileSchemaData, 
} from '../types/player.types';

export const initialRegistrationSchema = Joi.object<InitialRegistrationData>({
  name: Joi.string().trim().pattern(/^[\p{L}\s]+$/u).required(),
  mobile: Joi.string().trim().pattern(/^[5-9][0-9]{9}$/) .required(),
  email: Joi.string().trim().email().allow('').required()
});

export const updateProfileSchema = Joi.object<UpdateProfileSchemaData>({
  playerId: Joi.number().required().min(1),
  jerseyNumber: Joi.string()
  .pattern(/^[0-9]{1,6}$/)
  .allow('', null)
  .optional()
  .custom((value, helpers) => {
    if (value === '' || value === null) return null;
    
    const num = parseInt(value, 10);
    if (num < 1) return helpers.error('number.min');
    if (num > 100000) return helpers.error('number.max');
    
    return num; // Return as number
  }),
  tShirtSize: Joi.string().trim().allow('', null).alphanum().optional(),
  lowerSize: Joi.string().trim().allow('', null).alphanum().optional(),
  hasCricheroesProfile: Joi.boolean().allow('', null).optional(),
  isPaidPlayer: Joi.boolean().allow('', null).optional(),
  image: Joi.number().allow('', null).min(1).max(100000).optional(),
  pricePerMatch: Joi.number().allow('', null).min(1).max(100000).optional(),
  willJoinAnyOwner: Joi.boolean().allow('', null).optional(),
  isSubmitted: Joi.boolean().allow('').optional()
});
