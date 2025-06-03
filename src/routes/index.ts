import express, { Router } from 'express';
import { PlayerController } from '../controllers/player.controller';
import { AuthController } from '../controllers/auth.controller';
import * as playerValidation from '../validations/player.validations';
import * as authValidation from '../validations/auth.validations';
import * as fileValidation from '../validations/file.validations';
import { validate } from '../middleware/validation.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { FileController } from '../controllers/file.controller';

const router = Router();

// Public routes
router.use('/uploads', express.static('uploads'));

router.post('/initialRegistration', validate(playerValidation.initialRegistrationSchema), PlayerController.initialRegistration);
router.post('/upload', validate(fileValidation.uploadFile), FileController.uploadImage);
router.post('/updateProfile', validate(playerValidation.updateProfileSchema), PlayerController.updateProfile);
router.post('/sendOTP', validate(authValidation.sendOTPSchema), AuthController.sendOTP);
router.post('/verifyOTP', validate(authValidation.verifyOTPSchema), AuthController.verifyOTP);
router.post('/resetPassword', validate(authValidation.resetPasswordSchema), AuthController.resetPassword);
router.post('/login', validate(authValidation.loginSchema), AuthController.login);

// Protected routes under /auth
router.use('/auth', authMiddleware);
router.get('/auth/players', PlayerController.getPlayers);

export default router;