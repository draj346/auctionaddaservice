import express, { Router } from 'express';
import { PlayerController } from '../controllers/player.controller';
import { AuthController } from '../controllers/auth.controller';
import * as registrationValidation from '../validations/registration.validations';
import * as authValidation from '../validations/auth.validations';
import * as fileValidation from '../validations/file.validations';
import * as roleValidation from '../validations/role.validations';
import * as playerValidation from '../validations/player.validations';
import * as notificationValidation from '../validations/notification.validations';
import * as auctionValidation from '../validations/auction.validations';
import * as contactValidation from '../validations/contact.validations';
import { validate } from '../middleware/validation.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { FileController } from '../controllers/file.controller';
import { RegistrationController } from '../controllers/registration.controller';
import { CheckPermission } from '../middleware/permissions.middleware';
import { PlayerRole, ROLES } from '../constants/roles.constants';
import { RoleController } from '../controllers/role.controller';
import path from 'path';
import { NotificationController } from '../controllers/notification.controller';
import { AuctionController } from '../controllers/auction.controller';
import { ContactController } from '../controllers/contact.controller';
import { CommonController } from '../controllers/common.controller';
import { CategoryController } from '../controllers/category.controller';
import { TeamsController } from '../controllers/teams.controller';

const router = Router();

// Public routes
router.use('/uploads', express.static(path.join(path.resolve(), 'public', 'uploads'), {
  maxAge: '1d',
  setHeaders: (res) => {
    res.set('X-Static-Serve', 'true');
  }
}));
router.use('/banner', express.static(path.join(path.resolve(), 'public', 'banner'), {
  maxAge: '1d',
  setHeaders: (res) => {
    res.set('X-Static-Serve', 'true');
  }
}));
router.use('/payments', express.static(path.join(path.resolve(), 'public', 'payments'), {
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

//Contact Message
router.post('/addComment', validate(contactValidation.insertMessageSchema), ContactController.insertComment);

//Guest
router.get('/banners', CommonController.getBanner);
router.get('/discount', CommonController.getDiscount);
router.get('/videos', CommonController.getYoutubeVideos);


// Protected routes under /auth
router.use('/auth', authMiddleware);

// Validate JWT Token
router.get('/auth/validate', AuthController.isJWTTokenValid);


//Notifications
router.post('/auth/players/notifications/actions/update', validate(notificationValidation.updatePendingActionSchema), NotificationController.updatePendingAction);
router.put('/auth/players/notifications/read', NotificationController.updateIsRead);
router.get('/auth/players/notifications/count', NotificationController.getNewNotificationCount);
router.get('/auth/players/notifications', NotificationController.getMyNotification);

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
// Auction
router.post('/auth/auctions/upload', validate(fileValidation.userUploadForAuctionSchema), FileController.userUploadForAuction);
router.post('/auth/auctions/payment/upload', validate(fileValidation.uploadFileForJoiningAuctionSchema), FileController.uploadFileForJoiningAuctionSchema);
router.post('/auth/auctions/new', validate(auctionValidation.upsetAuctionSchema), AuctionController.upsetAuction);
router.get('/auth/auctions', AuctionController.getAuctions);
router.get('/auth/auctions/upcoming', AuctionController.getUpcomingAuctions);
router.get('/auth/auctions/live', AuctionController.getLiveAuctions);
router.get('/auth/auctions/my', AuctionController.getMyAuctions);
router.get('/auth/auctions/forCopy', AuctionController.getAuctionsForCopy);
router.post('/auth/auctions/:auctionId/copy', validate(auctionValidation.auctionIdSchema, 'params'), AuctionController.copyAuction);
router.delete('/auth/auctions/:auctionId/delete', validate(auctionValidation.auctionIdSchema, 'params'), AuctionController.deleteAuction);
router.put('/auth/auctions/:auctionId/approve', CheckPermission([ROLES.ADMIN, ROLES.SUPER_ADMIN] as PlayerRole[]), validate(auctionValidation.auctionIdSchema, 'params'), AuctionController.approveAuction);
router.put('/auth/auctions/:auctionId/completed', validate(auctionValidation.auctionIdSchema, 'params'), AuctionController.updateAuctionCompletionStatus);
router.get('/auth/auctions/search', CheckPermission([ROLES.ADMIN, ROLES.SUPER_ADMIN] as PlayerRole[]), validate(auctionValidation.auctionSearchTextSchema, "query"), AuctionController.getAuctionBySearch);
router.get('/auth/auctions/code', validate(auctionValidation.auctionCodeSchema, "query"), AuctionController.getAuctionByCodeForJoin);
//Contact Message
router.get('/auth/getUnWorkComment', CheckPermission([ROLES.ADMIN, ROLES.SUPER_ADMIN] as PlayerRole[]), ContactController.getUnWorkComment);
router.get('/auth/getWorkComment', CheckPermission([ROLES.ADMIN, ROLES.SUPER_ADMIN] as PlayerRole[]), ContactController.getWorkComment);
router.get('/auth/updateWorkStatus', CheckPermission([ROLES.ADMIN, ROLES.SUPER_ADMIN] as PlayerRole[]), validate(contactValidation.updateWorkStatusSchema), ContactController.updateWorkStatus);
//Category
router.post('/auth/auctions/:auctionId/category/new',  validate(auctionValidation.auctionIdSchema, 'params'), validate(auctionValidation.upsetCategorySchema), CategoryController.upsetCategory);
router.get('/auth/auctions/:auctionId/categories/:categoryId/participants', validate(auctionValidation.auctionCategoryIdSchema, 'params'),  validate(playerValidation.auctionPlayerPaginationSchema, "query"), PlayerController.getParticipantPlayersForCategory);
router.get('/auth/auctions/:auctionId/categories', validate(auctionValidation.auctionIdSchema, 'params'), CategoryController.getCategoryByAuction);
router.delete('/auth/auctions/:auctionId/categories/:categoryId/delete', validate(auctionValidation.auctionCategoryIdSchema, 'params'), CategoryController.deleteCategory);
router.get('/auth/auctions/:auctionId/teams/:teamId/owner', validate(auctionValidation.auctionTeamIdSchema, 'params'),validate(playerValidation.ownerPaginationSchema, "query"), PlayerController.getOwnerForTeam);
//Teams
router.post('/auth/auctions/:auctionId/team/new',  validate(auctionValidation.auctionIdSchema, 'params'), validate(auctionValidation.upsetTeamSchema), TeamsController.upsetTeam);
router.get('/auth/auctions/:auctionId/teams', validate(auctionValidation.auctionIdSchema, 'params'), TeamsController.getTeamsByAuction);
router.delete('/auth/auctions/:auctionId/teams/:teamId/delete', validate(auctionValidation.auctionTeamIdSchema, 'params'), TeamsController.deleteTeam);
router.post('/auth/team/owner/assign', validate(auctionValidation.assignOwnerToTeamSchema), TeamsController.assignOwnerToTeam);
router.delete('/auth/team/owner/remove', validate(auctionValidation.removeOwnerFromTeamSchema), TeamsController.removeOwnerFromTeam);
router.get('/auth/auctions/:auctionId/canAddTeam', validate(auctionValidation.auctionIdSchema, 'params'), TeamsController.canAddTeam);
router.get('/auth/auctions/:auctionId/playersForAuction', validate(auctionValidation.auctionIdSchema, 'params'), validate(playerValidation.auctionPlayerPaginationSchema, "query"), PlayerController.getPlayersForAuction);
router.get('/auth/auctions/:auctionId/playersForCategory', validate(auctionValidation.auctionIdSchema, 'params'), validate(playerValidation.auctionPlayerPaginationSchema, "query"), PlayerController.getPlayersForCategory);
router.get('/auth/auctions/:auctionId/playersForTeam', validate(auctionValidation.auctionIdSchema, 'params'), validate(playerValidation.auctionPlayerPaginationSchema, "query"), PlayerController.getPlayersForTeam);
router.get('/auth/auctions/:auctionId/players/count', validate(auctionValidation.auctionIdSchema, 'params'), AuctionController.getPendingPlayerCountForAuction);
router.get('/auth/auctions/:auctionId/players/participants', validate(auctionValidation.auctionIdSchema, 'params'),  validate(playerValidation.auctionPlayerPaginationSchema, "query"), PlayerController.getAddedPlayersForAuction);
router.post('/auth/auctions/team/players/retain', validate(auctionValidation.updatePlayerToTeamSchema), TeamsController.retainPlayerToTeam);
router.post('/auth/auctions/team/players/add', validate(auctionValidation.updatePlayerToTeamSchema), TeamsController.addPlayerToTeam);
router.delete('/auth/auctions/team/players/remove', validate(auctionValidation.updatePlayerToTeamSchema), TeamsController.removePlayerFromTeam);
router.delete('/auth/auctions/team/players/trialRemove', validate(auctionValidation.updatePlayerToTeamSchema), TeamsController.tempRemovePlayerFromTeam);
router.get('/auth/auctions/:auctionId/teams/:teamId/participants', validate(auctionValidation.auctionTeamIdSchema, 'params'),  validate(playerValidation.auctionPlayerPaginationSchema, "query"), PlayerController.getParticipantPlayersForTeams);
router.get('/auth/auctions/:auctionId/teams/:teamId/players/count', validate(auctionValidation.auctionTeamIdSchema, 'params'), TeamsController.getTeamPlayerCount);

//Add Players
router.post('/auth/auctions/players/add', validate(auctionValidation.updatePlayerToAuctionSchema), AuctionController.addPlayerToAuction);
router.post('/auth/auctions/players/join', validate(auctionValidation.JoinAuctionSchema), AuctionController.joinPlayerToAuction);
router.delete('/auth/auctions/:auctionId/players/exit',validate(auctionValidation.auctionIdSchema, 'params'), AuctionController.removeSelfFromAuction);
router.post('/auth/auctions/players/approve', validate(auctionValidation.approveAuctionForAuctionSchema), AuctionController.approvePlayerForAuction);
router.post('/auth/auctions/players/sr', CheckPermission([ROLES.SUPER_ADMIN] as PlayerRole[]), validate(auctionValidation.approveAuctionForAuctionSchema), AuctionController.starPlayerForAuction);
router.post('/auth/auctions/players/ur', CheckPermission([ROLES.SUPER_ADMIN] as PlayerRole[]), validate(auctionValidation.approveAuctionForAuctionSchema), AuctionController.unStarPlayerForAuction);
router.delete('/auth/auctions/players/remove', validate(auctionValidation.updatePlayerToAuctionSchema), AuctionController.removePlayerFromAuction);
router.post('/auth/auctions/category/players/add', validate(auctionValidation.updatePlayerToCategorySchema), CategoryController.addPlayerToCategory);
router.delete('/auth/auctions/category/players/remove', validate(auctionValidation.updatePlayerToCategorySchema), CategoryController.removePlayerFromCategory);

// For real auction
router.get('/auth/auctions/:auctionId/liveAuctionTeams', validate(auctionValidation.auctionIdSchema, 'params'), TeamsController.getTeamsByAuctionId);
router.get('/auth/auctions/:auctionId/liveAuctionPlayers', validate(auctionValidation.auctionIdSchema, 'params'), AuctionController.getAuctionPlayers);
router.get('/auth/auctions/:auctionId/liveAuctionInfo', validate(auctionValidation.auctionIdSchema, 'params'), AuctionController.getAuctionInfo);
router.post('/auth/auctions/:auctionId/reset', validate(auctionValidation.auctionIdSchema, 'params'), AuctionController.resetAuctionPlayers);
router.post('/auth/auctions/:auctionId/unsold', validate(auctionValidation.auctionIdSchema, 'params'), AuctionController.reauctionUnsoldPlayer);
router.put('/auth/auctions/:auctionId/players/:playerId/:status', validate(auctionValidation.auctionAndPlayerIdSchema, 'params'), AuctionController.updatePlayerAuctionStatus);
router.put('/auth/auctions/:auctionId/order/:type', validate(auctionValidation.playerOrderSchema, 'params'), AuctionController.updatePlayerOrder);
router.put('/auth/auctions/:auctionId/live', validate(auctionValidation.auctionIdSchema, 'params'), AuctionController.updateLiveAuctionMode);


router.get('/auth/auctions/file/:fileId',validate(auctionValidation.auctionFileIdSchema, 'params'), FileController.getPaymentFilePath);
router.get('/auth/auctions/:auctionId/teams/:teamId', validate(auctionValidation.auctionTeamIdSchema, 'params'), TeamsController.getTeamById);
router.get('/auth/auctions/:auctionId/categories/:categoryId', validate(auctionValidation.auctionCategoryIdSchema, 'params'), CategoryController.getcategoryById);
router.get('/auth/auctions/:auctionId',validate(auctionValidation.auctionIdSchema, 'params'), AuctionController.getAuctionById);

export default router;