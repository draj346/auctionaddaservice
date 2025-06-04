import Joi from 'joi';
import { FileData } from '../types/file.types';

export const uploadFile = Joi.object<FileData>({
  userId: Joi.number().min(1).required(),
  fileId: Joi.number().allow('', null).min(1).required(),
  image: Joi.binary().required(),
});