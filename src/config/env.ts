import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
export const DB_HOST = process.env.DB_HOST!;
export const DB_USER = process.env.DB_USER!;
export const DB_PASSWORD = process.env.DB_PASSWORD!;
export const DB_NAME = process.env.DB_NAME!;
export const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306;
export const JWT_SECRET = process.env.JWT_SECRET!;
export const FILE_UPLOAD_LOCATION = process.env.FILE_UPLOAD_LOCATION!;
export const FILE_UPLOAD_FOLDER = process.env.FILE_UPLOAD_FOLDER!;
export const OTP_EXPIRY_MINUTES = process.env.OTP_EXPIRY_MINUTES 
  ? parseInt(process.env.OTP_EXPIRY_MINUTES) 
  : 2;
export const FREE_AUCTION_CREATE_LIMIT = process.env.FREE_AUCTION_CREATE_LIMIT 
  ? parseInt(process.env.FREE_AUCTION_CREATE_LIMIT) 
  : 1;
