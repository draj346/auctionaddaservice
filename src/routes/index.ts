import express, { Router } from 'express';
import { PlayerController } from '../controllers/player.controller';
import { AuthController } from '../controllers/auth.controller';
import * as registrationValidation from '../validations/registration.validations';
import * as authValidation from '../validations/auth.validations';
import * as fileValidation from '../validations/file.validations';
import * as roleValidation from '../validations/role.validations';
import * as playerValidation from '../validations/player.validations';
import * as NotificationValidation from '../validations/notification.validations';
import { validate } from '../middleware/validation.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { FileController } from '../controllers/file.controller';
import { RegistrationController } from '../controllers/registration.controller';
import { CheckPermission } from '../middleware/permissions.middleware';
import { PlayerRole, ROLES } from '../constants/roles.constants';
import { RoleController } from '../controllers/role.controller';
import path from 'path';
import { NotificationController } from '../controllers/notification.controller';

const router = Router();

// Public routes
router.use('/uploads', express.static(path.join(path.resolve(), 'public', 'uploads'), {
  maxAge: '1d',
  setHeaders: (res) => {
    res.set('X-Static-Serve', 'true');
  }
}));
router.post('/upload', validate(fileValidation.uploadFile), FileController.uploadImage);

// Registration
router.post('/initialRegistration', validate(registrationValidation.initialRegistrationSchema), RegistrationController.initialRegistration);
router.post('/addPlayerInformation', validate(registrationValidation.updateProfileSchema), RegistrationController.addPlayerInformation);

// Login and Reset Password
router.post('/sendOTP', validate(authValidation.sendOTPSchema), AuthController.sendOTP);
router.post('/verifyOTP', validate(authValidation.verifyOTPSchema), AuthController.verifyOTP);
router.post('/resetPassword', validate(authValidation.resetPasswordSchema), AuthController.resetPassword);
router.post('/login', validate(authValidation.loginSchema), AuthController.login);

// Protected routes under /auth
router.use('/auth', authMiddleware);

// Validate JWT Token
router.get('/auth/validate', AuthController.isJWTTokenValid);

// Players API
router.get('/auth/players',validate(playerValidation.playerPaginationSchema, "query"), PlayerController.getPlayers);
router.get('/auth/players/admins',validate(playerValidation.adminsPaginationSchema, "query"), CheckPermission([ROLES.SUPER_ADMIN] as PlayerRole[]), PlayerController.getAdmins);
router.get('/auth/players/:playerId',validate(roleValidation.playerIdSchema, 'params'), PlayerController.getPlayersById);
router.get('/auth/players/:playerId/edit',validate(roleValidation.playerIdSchema, 'params'), PlayerController.getPlayersByIdForEdit);
router.post('/auth/players/add', validate(registrationValidation.addProfileSchema),  CheckPermission([ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.ORGANISER] as PlayerRole[]), RegistrationController.addPlayers);
router.put('/auth/players/:playerId/update', validate(roleValidation.playerIdSchema, 'params'), validate(registrationValidation.updateProfileByRoleSchema), RegistrationController.updatePlayersByRole);
router.delete('/auth/players/:playerId/delete', CheckPermission([ROLES.ADMIN, ROLES.SUPER_ADMIN] as PlayerRole[]), validate(roleValidation.playerIdSchema, 'params'), RegistrationController.deletePlayer);
router.delete('/auth/players/deactivate', CheckPermission([ROLES.ADMIN, ROLES.SUPER_ADMIN] as PlayerRole[]), validate(roleValidation.playerIdsSchema), RegistrationController.deactivatePlayers);
router.post('/auth/players/activate', CheckPermission([ROLES.ADMIN, ROLES.SUPER_ADMIN] as PlayerRole[]), validate(roleValidation.playerIdsSchema), RegistrationController.activatePlayers);
router.delete('/auth/players/nonplayer', CheckPermission([ROLES.ADMIN, ROLES.SUPER_ADMIN] as PlayerRole[]), validate(roleValidation.playerIdsSchema), RegistrationController.updateToNonPlayers);
router.delete('/auth/players/toplayer', CheckPermission([ROLES.ADMIN, ROLES.SUPER_ADMIN] as PlayerRole[]), validate(roleValidation.playerIdsSchema), RegistrationController.updateToPlayers);
router.post('/auth/players/import', validate(fileValidation.AddPlayersFile), CheckPermission([ROLES.ADMIN, ROLES.SUPER_ADMIN] as PlayerRole[]), RegistrationController.AddMultiplePlayers);
router.post('/auth/players/export', validate(roleValidation.playerIdsOptionalSchema), CheckPermission([ROLES.ADMIN, ROLES.SUPER_ADMIN] as PlayerRole[]), PlayerController.exportPlayers);
// Upload User Image
router.post('/auth/upload', validate(fileValidation.userUploadFile), FileController.userUploadImage);
// Create/Remove Admin
router.put('/auth/players/:playerId/role/admin', validate(roleValidation.playerIdSchema, 'params'), CheckPermission([ROLES.SUPER_ADMIN] as PlayerRole[]), RoleController.createAdmin);
router.delete('/auth/players/:playerId/role/admin/delete', validate(roleValidation.playerIdSchema, 'params'), CheckPermission([ROLES.SUPER_ADMIN] as PlayerRole[]), RoleController.removeAdmin);
// Approved Player
router.post('/auth/players/approve', validate(roleValidation.playerIdsSchema), CheckPermission([ROLES.SUPER_ADMIN, ROLES.ADMIN] as PlayerRole[]), RoleController.approvePlayers);

//Notifications
router.post('/auth/players/notifications', NotificationController.getMyNotification);
router.post('/auth/players/notifications/count', NotificationController.getNewNotificationCount);
router.post('/auth/players/notifications/read', NotificationController.updateIsRead);
router.post('/auth/players/notifications/actions', NotificationController.getMyPendingActionList);
router.post('/auth/players/notifications/actions/update', validate(NotificationValidation.updatePendingActionSchema), NotificationController.updatePendingAction);


export default router;