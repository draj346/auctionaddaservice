"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const player_controller_1 = require("../controllers/player.controller");
const auth_controller_1 = require("../controllers/auth.controller");
const registrationValidation = __importStar(require("../validations/registration.validations"));
const authValidation = __importStar(require("../validations/auth.validations"));
const fileValidation = __importStar(require("../validations/file.validations"));
const roleValidation = __importStar(require("../validations/role.validations"));
const playerValidation = __importStar(require("../validations/player.validations"));
const notificationValidation = __importStar(require("../validations/notification.validations"));
const auctionValidation = __importStar(require("../validations/auction.validations"));
const contactValidation = __importStar(require("../validations/contact.validations"));
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const file_controller_1 = require("../controllers/file.controller");
const registration_controller_1 = require("../controllers/registration.controller");
const permissions_middleware_1 = require("../middleware/permissions.middleware");
const roles_constants_1 = require("../constants/roles.constants");
const role_controller_1 = require("../controllers/role.controller");
const path_1 = __importDefault(require("path"));
const notification_controller_1 = require("../controllers/notification.controller");
const auction_controller_1 = require("../controllers/auction.controller");
const contact_controller_1 = require("../controllers/contact.controller");
const router = (0, express_1.Router)();
// Public routes
router.use('/uploads', express_1.default.static(path_1.default.join(path_1.default.resolve(), 'public', 'uploads'), {
    maxAge: '1d',
    setHeaders: (res) => {
        res.set('X-Static-Serve', 'true');
    }
}));
router.post('/upload', (0, validation_middleware_1.validate)(fileValidation.uploadFile), file_controller_1.FileController.uploadImage);
// Registration
router.post('/initialRegistration', (0, validation_middleware_1.validate)(registrationValidation.initialRegistrationSchema), registration_controller_1.RegistrationController.initialRegistration);
router.post('/addPlayerInformation', (0, validation_middleware_1.validate)(registrationValidation.updateProfileSchema), registration_controller_1.RegistrationController.addPlayerInformation);
// Login and Reset Password
router.post('/sendOTP', (0, validation_middleware_1.validate)(authValidation.sendOTPSchema), auth_controller_1.AuthController.sendOTP);
router.post('/verifyOTP', (0, validation_middleware_1.validate)(authValidation.verifyOTPSchema), auth_controller_1.AuthController.verifyOTP);
router.post('/resetPassword', (0, validation_middleware_1.validate)(authValidation.resetPasswordSchema), auth_controller_1.AuthController.resetPassword);
router.post('/login', (0, validation_middleware_1.validate)(authValidation.loginSchema), auth_controller_1.AuthController.login);
//Contact Message
router.post('/addComment', (0, validation_middleware_1.validate)(contactValidation.insertMessageSchema), contact_controller_1.ContactController.insertComment);
// Protected routes under /auth
router.use('/auth', auth_middleware_1.authMiddleware);
// Validate JWT Token
router.get('/auth/validate', auth_controller_1.AuthController.isJWTTokenValid);
//Notifications
router.post('/auth/players/notifications/actions/update', (0, validation_middleware_1.validate)(notificationValidation.updatePendingActionSchema), notification_controller_1.NotificationController.updatePendingAction);
router.put('/auth/players/notifications/read', notification_controller_1.NotificationController.updateIsRead);
router.get('/auth/players/notifications/count', notification_controller_1.NotificationController.getNewNotificationCount);
router.get('/auth/players/notifications', notification_controller_1.NotificationController.getMyNotification);
// Players API
router.get('/auth/players', (0, validation_middleware_1.validate)(playerValidation.playerPaginationSchema, "query"), player_controller_1.PlayerController.getPlayers);
router.get('/auth/players/admins', (0, validation_middleware_1.validate)(playerValidation.adminsPaginationSchema, "query"), (0, permissions_middleware_1.CheckPermission)([roles_constants_1.ROLES.SUPER_ADMIN]), player_controller_1.PlayerController.getAdmins);
router.get('/auth/players/:playerId', (0, validation_middleware_1.validate)(roleValidation.playerIdSchema, 'params'), player_controller_1.PlayerController.getPlayersById);
router.get('/auth/players/:playerId/edit', (0, validation_middleware_1.validate)(roleValidation.playerIdSchema, 'params'), player_controller_1.PlayerController.getPlayersByIdForEdit);
router.post('/auth/players/add', (0, validation_middleware_1.validate)(registrationValidation.addProfileSchema), (0, permissions_middleware_1.CheckPermission)([roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.SUPER_ADMIN, roles_constants_1.ROLES.ORGANISER]), registration_controller_1.RegistrationController.addPlayers);
router.put('/auth/players/:playerId/update', (0, validation_middleware_1.validate)(roleValidation.playerIdSchema, 'params'), (0, validation_middleware_1.validate)(registrationValidation.updateProfileByRoleSchema), registration_controller_1.RegistrationController.updatePlayersByRole);
router.delete('/auth/players/:playerId/delete', (0, permissions_middleware_1.CheckPermission)([roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.SUPER_ADMIN]), (0, validation_middleware_1.validate)(roleValidation.playerIdSchema, 'params'), registration_controller_1.RegistrationController.deletePlayer);
router.delete('/auth/players/deactivate', (0, permissions_middleware_1.CheckPermission)([roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.SUPER_ADMIN]), (0, validation_middleware_1.validate)(roleValidation.playerIdsSchema), registration_controller_1.RegistrationController.deactivatePlayers);
router.post('/auth/players/activate', (0, permissions_middleware_1.CheckPermission)([roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.SUPER_ADMIN]), (0, validation_middleware_1.validate)(roleValidation.playerIdsSchema), registration_controller_1.RegistrationController.activatePlayers);
router.delete('/auth/players/nonplayer', (0, permissions_middleware_1.CheckPermission)([roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.SUPER_ADMIN]), (0, validation_middleware_1.validate)(roleValidation.playerIdsSchema), registration_controller_1.RegistrationController.updateToNonPlayers);
router.delete('/auth/players/toplayer', (0, permissions_middleware_1.CheckPermission)([roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.SUPER_ADMIN]), (0, validation_middleware_1.validate)(roleValidation.playerIdsSchema), registration_controller_1.RegistrationController.updateToPlayers);
router.post('/auth/players/import', (0, validation_middleware_1.validate)(fileValidation.AddPlayersFile), (0, permissions_middleware_1.CheckPermission)([roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.SUPER_ADMIN]), registration_controller_1.RegistrationController.AddMultiplePlayers);
router.post('/auth/players/export', (0, validation_middleware_1.validate)(roleValidation.playerIdsOptionalSchema), (0, permissions_middleware_1.CheckPermission)([roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.SUPER_ADMIN]), player_controller_1.PlayerController.exportPlayers);
// Upload User Image
router.post('/auth/upload', (0, validation_middleware_1.validate)(fileValidation.userUploadFile), file_controller_1.FileController.userUploadImage);
// Create/Remove Admin
router.put('/auth/players/:playerId/role/admin', (0, validation_middleware_1.validate)(roleValidation.playerIdSchema, 'params'), (0, permissions_middleware_1.CheckPermission)([roles_constants_1.ROLES.SUPER_ADMIN]), role_controller_1.RoleController.createAdmin);
router.delete('/auth/players/:playerId/role/admin/delete', (0, validation_middleware_1.validate)(roleValidation.playerIdSchema, 'params'), (0, permissions_middleware_1.CheckPermission)([roles_constants_1.ROLES.SUPER_ADMIN]), role_controller_1.RoleController.removeAdmin);
// Approved Player
router.post('/auth/players/approve', (0, validation_middleware_1.validate)(roleValidation.playerIdsSchema), (0, permissions_middleware_1.CheckPermission)([roles_constants_1.ROLES.SUPER_ADMIN, roles_constants_1.ROLES.ADMIN]), role_controller_1.RoleController.approvePlayers);
// Auction
router.post('/auth/auctions/upload', (0, validation_middleware_1.validate)(fileValidation.userUploadForAuctionSchema), file_controller_1.FileController.userUploadForAuction);
router.post('/auth/auctions/new', (0, validation_middleware_1.validate)(auctionValidation.upsetAuctionSchema), auction_controller_1.AuctionController.upsetAuction);
router.get('/auth/auctions', auction_controller_1.AuctionController.getAuctions);
router.get('/auth/auctions/forCopy', auction_controller_1.AuctionController.getAuctionsForCopy);
router.post('/auth/auctions/:auctionId/copy', (0, validation_middleware_1.validate)(auctionValidation.auctionIdSchema, 'params'), auction_controller_1.AuctionController.copyAuction);
router.delete('/auth/auctions/:auctionId/delete', (0, validation_middleware_1.validate)(auctionValidation.auctionIdSchema, 'params'), auction_controller_1.AuctionController.deleteAuction);
router.put('/auth/auctions/:auctionId/approve', (0, permissions_middleware_1.CheckPermission)([roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.SUPER_ADMIN]), (0, validation_middleware_1.validate)(auctionValidation.auctionIdSchema, 'params'), auction_controller_1.AuctionController.approveAuction);
router.put('/auth/auctions/:auctionId/completed', (0, validation_middleware_1.validate)(auctionValidation.auctionIdSchema, 'params'), auction_controller_1.AuctionController.updateAuctionCompletionStatus);
router.get('/auth/auctions/search', (0, permissions_middleware_1.CheckPermission)([roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.SUPER_ADMIN]), (0, validation_middleware_1.validate)(auctionValidation.auctionSearchTextSchema, "query"), auction_controller_1.AuctionController.getAuctionBySearch);
router.get('/auth/auctions/:auctionId', (0, validation_middleware_1.validate)(auctionValidation.auctionIdSchema, 'params'), auction_controller_1.AuctionController.getAuctionById);
//Contact Message
router.get('/auth/getUnWorkComment', (0, permissions_middleware_1.CheckPermission)([roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.SUPER_ADMIN]), contact_controller_1.ContactController.getUnWorkComment);
router.get('/auth/getWorkComment', (0, permissions_middleware_1.CheckPermission)([roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.SUPER_ADMIN]), contact_controller_1.ContactController.getWorkComment);
router.get('/auth/updateWorkStatus', (0, permissions_middleware_1.CheckPermission)([roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.SUPER_ADMIN]), (0, validation_middleware_1.validate)(contactValidation.updateWorkStatusSchema), contact_controller_1.ContactController.updateWorkStatus);
exports.default = router;
