import Joi from 'joi';
import { AuctionFileData, ExcelFileData, FileData } from '../types/file.types';

export const uploadFile = Joi.object<FileData>({
  userId: Joi.number().min(1).required(),
  fileId: Joi.number().allow('', null).min(1).required(),
  image: Joi.binary().required(),
});

export const userUploadForAuctionSchema = Joi.object<AuctionFileData>({
  fileId: Joi.number().allow('', null).min(1).required(),
  auctionId: Joi.number().min(1).required(),
  image: Joi.binary().required(),
});

export const AddPlayersFile = Joi.object<ExcelFileData>({
  file: Joi.binary().required(),
});

export const userUploadFile = Joi.object<FileData>({
  fileId: Joi.number().allow('', null).min(1).required(),
  userId: Joi.number().min(1).required(),
  image: Joi.binary().required(),
});