import express, { Router } from 'express';
import { PlayerController } from '../controllers/player.controller';
import { AuthController } from '../controllers/auth.controller';
import * as playerValidation from '../validations/player.validations';
import * as authValidation from '../validations/auth.validations';
import { validate } from '../middleware/validation.middleware';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/initialRegistration', validate(playerValidation.initialRegistrationSchema), PlayerController.initialRegistration);
router.post('/updateProfile', validate(playerValidation.completeRegistrationSchema), PlayerController.completeRegistration);
router.post('/sendOTP', validate(authValidation.sendOTPSchema), AuthController.sendOTP);
router.post('/verifyOTP', validate(authValidation.verifyOTPSchema), AuthController.verifyOTP);
router.post('/resetPassword', validate(authValidation.resetPasswordSchema), AuthController.resetPassword);
router.post('/login', validate(authValidation.loginSchema), AuthController.login);
router.post('/upload', validate(playerValidation.uploadImage), PlayerController.uploadImage);
router.use('/uploads', express.static('uploads'));

// Protected routes under /auth
router.use('/auth', authMiddleware);
router.get('/auth/players', PlayerController.getPlayers);

export default router;