import express, { Router } from 'express';
import { PlayerController } from '../controllers/player.controller';
import { AuthController } from '../controllers/auth.controller';
import * as registrationValidation from '../validations/registration.validations';
import * as authValidation from '../validations/auth.validations';
import * as fileValidation from '../validations/file.validations';
import * as roleValidation from '../validations/role.validations';
import { validate } from '../middleware/validation.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { FileController } from '../controllers/file.controller';
import { RegistrationController } from '../controllers/registration.controller';
import { CheckPermission } from '../middleware/permissions.middleware';
import { PlayerRole, ROLES } from '../constants/roles.constants';
import { RoleController } from '../controllers/role.controller';

const router = Router();

// Public routes
router.use('/uploads', express.static('uploads'));
router.post('/upload', validate(fileValidation.uploadFile), FileController.uploadImage);

// Registration
router.post('/initialRegistration', validate(registrationValidation.initialRegistrationSchema), RegistrationController.initialRegistration);
router.post('/updateProfile', validate(registrationValidation.updateProfileSchema), RegistrationController.updatePlayers);

// Login and Reset Password
router.post('/sendOTP', validate(authValidation.sendOTPSchema), AuthController.sendOTP);
router.post('/verifyOTP', validate(authValidation.verifyOTPSchema), AuthController.verifyOTP);
router.post('/resetPassword', validate(authValidation.resetPasswordSchema), AuthController.resetPassword);
router.post('/login', validate(authValidation.loginSchema), AuthController.login);

// Protected routes under /auth
router.use('/auth', authMiddleware);

// Players API
router.get('/auth/players', PlayerController.getPlayers);
router.get('/auth/players/inactive', CheckPermission([ROLES.ADMIN, ROLES.SUPER_ADMIN] as PlayerRole[]), PlayerController.getInactivePlayers);
router.post('/auth/players/add', validate(registrationValidation.addProfileSchema),  CheckPermission([ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.ORGANISER] as PlayerRole[]), RegistrationController.addPlayers);
router.put('/auth/players/:playerId/update', validate(roleValidation.playerIdSchema, 'params'), validate(registrationValidation.updateProfileByRoleSchema), RegistrationController.updatePlayersByRole);
router.delete('/auth/players/:playerId/delete', CheckPermission([ROLES.ADMIN, ROLES.SUPER_ADMIN] as PlayerRole[]), validate(roleValidation.playerIdSchema, 'params'), RegistrationController.deletePlayers);
router.post('/auth/players/import', validate(fileValidation.AddPlayersFile), CheckPermission([ROLES.ADMIN, ROLES.SUPER_ADMIN] as PlayerRole[]), RegistrationController.AddMultiplePlayers);
router.post('/auth/players/export', CheckPermission([ROLES.ADMIN, ROLES.SUPER_ADMIN] as PlayerRole[]), PlayerController.exportPlayers);


// Create/Remove Admin
router.put('/auth/players/:playerId/role/admin', validate(roleValidation.playerIdSchema, 'params'), CheckPermission([ROLES.SUPER_ADMIN] as PlayerRole[]), RoleController.createAdmin);
router.delete('/auth/players/:playerId/role/admin/delete', validate(roleValidation.playerIdSchema, 'params'), CheckPermission([ROLES.SUPER_ADMIN] as PlayerRole[]), RoleController.removeAdmin);

// Approved Player
router.post('/auth/players/approve', validate(roleValidation.playerIdsSchema,), CheckPermission([ROLES.SUPER_ADMIN, ROLES.ADMIN] as PlayerRole[]), RoleController.approvePlayers);

export default router;