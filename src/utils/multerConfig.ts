import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { FILE_UPLOAD_LOCATION, PAYMENT_FILE_UPLOAD_LOCATION } from '../config/env';

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    cb(null, FILE_UPLOAD_LOCATION); // Save directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const paymentStorage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    cb(null, PAYMENT_FILE_UPLOAD_LOCATION); // Save directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter for images only
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeValid = allowedTypes.test(file.mimetype);
  
  if (extValid && mimeValid) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: fileFilter
});

const paymentUpload = multer({
  storage: paymentStorage,
  limits: { fileSize: 1 * 1024 * 1024 },
  fileFilter: fileFilter
});

const memoryStorage = multer.memoryStorage();

const uploadToMemory = multer({ 
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

export {upload, uploadToMemory, paymentUpload};