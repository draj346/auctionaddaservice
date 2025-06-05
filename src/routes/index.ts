import express, { Router } from 'express';
import { PlayerController } from '../controllers/player.controller';
import { AuthController } from '../controllers/auth.controller';
import * as registrationValidation from '../validations/registration.validations';
import * as authValidation from '../validations/auth.validations';
import * as fileValidation from '../validations/file.validations';
import { validate } from '../middleware/validation.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { FileController } from '../controllers/file.controller';
import { RegistrationController } from '../controllers/registration.controller';
import { PERMISSIONS } from '../types/permissions.types';
import { checkPermission } from '../middleware/permissions.middleware';

const router = Router();

// Public routes
router.use('/uploads', express.static('uploads'));
router.post('/upload', validate(fileValidation.uploadFile), FileController.uploadImage);

// Registration
router.post('/initialRegistration', validate(registrationValidation.initialRegistrationSchema), RegistrationController.initialRegistration);
router.post('/updateProfile', validate(registrationValidation.updateProfileSchema), RegistrationController.updateProfile);

// Login and Reset Password
router.post('/sendOTP', validate(authValidation.sendOTPSchema), AuthController.sendOTP);
router.post('/verifyOTP', validate(authValidation.verifyOTPSchema), AuthController.verifyOTP);
router.post('/resetPassword', validate(authValidation.resetPasswordSchema), AuthController.resetPassword);
router.post('/login', validate(authValidation.loginSchema), AuthController.login);

// Protected routes under /auth
router.use('/auth', authMiddleware);

// Players API
router.get('/auth/players', checkPermission([PERMISSIONS.TEAM, PERMISSIONS.SELF]), PlayerController.getPlayers);

export default router;