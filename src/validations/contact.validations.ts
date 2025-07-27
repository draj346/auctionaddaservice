import Joi from "joi";
import { ICreateContactMessage, IUpdateContactMessage } from "../types/contact.types";

export const insertMessageSchema = Joi.object<ICreateContactMessage>({
  name: Joi.string().trim().required(),
  mobile: Joi.string().trim().pattern(/^[5-9][0-9]{9}$/) .required(),
  email: Joi.string().trim().email().required(),
  subject: Joi.string().trim().required().max(200),
  message: Joi.string().trim().required().max(500),
});

export const updateWorkStatusSchema = Joi.object<IUpdateContactMessage>({
  id: Joi.number().integer().min(1).required(),
});