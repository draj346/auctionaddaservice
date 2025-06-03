import Joi from 'joi';
import { FileData } from '../types/file.types';

export const uploadFile = Joi.object<FileData>({
  userId: Joi.number().required(),
  fileId: Joi.number().allow('').required(),
  image: Joi.binary().required(),
});