import Joi from 'joi';
import { 
  InitialRegistrationData, 
  CompleteRegistrationData, 
  RegistrationProfileImage
} from '../types/player.types';

export const initialRegistrationSchema = Joi.object<InitialRegistrationData>({
  name: Joi.string().required(),
  mobile: Joi.string().required(),
  email: Joi.string().email().allow('').required()
});

export const completeRegistrationSchema = Joi.object<CompleteRegistrationData>({
  playerId: Joi.number().required(),
  jerseyNumber: Joi.number().allow(null).required(),
  tShirtSize: Joi.string().allow('').required(),
  lowerSize: Joi.string().allow('').required(),
  hasCricheroesProfile: Joi.boolean().required(),
  isPaidPlayer: Joi.boolean().required(),
  pricePerMatch: Joi.number().allow(null).required(),
  willJoinAnyOwner: Joi.boolean().required(),
  isSubmitted: Joi.boolean().required(),
  isNonPlayer: Joi.boolean().required(),
  isOwner: Joi.boolean().required(),
  isAdmin: Joi.boolean().required()
});

export const uploadImage = Joi.object<RegistrationProfileImage>({
  playerId: Joi.number().required(),
  image: Joi.binary().required()
});