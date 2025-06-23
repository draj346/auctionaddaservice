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
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const file_controller_1 = require("../controllers/file.controller");
const registration_controller_1 = require("../controllers/registration.controller");
const permissions_middleware_1 = require("../middleware/permissions.middleware");
const roles_constants_1 = require("../constants/roles.constants");
const role_controller_1 = require("../controllers/role.controller");
const path_1 = __importDefault(require("path"));
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
router.post('/updateProfile', (0, validation_middleware_1.validate)(registrationValidation.updateProfileSchema), registration_controller_1.RegistrationController.updatePlayers);
// Login and Reset Password
router.post('/sendOTP', (0, validation_middleware_1.validate)(authValidation.sendOTPSchema), auth_controller_1.AuthController.sendOTP);
router.post('/verifyOTP', (0, validation_middleware_1.validate)(authValidation.verifyOTPSchema), auth_controller_1.AuthController.verifyOTP);
router.post('/resetPassword', (0, validation_middleware_1.validate)(authValidation.resetPasswordSchema), auth_controller_1.AuthController.resetPassword);
router.post('/login', (0, validation_middleware_1.validate)(authValidation.loginSchema), auth_controller_1.AuthController.login);
// Protected routes under /auth
router.use('/auth', auth_middleware_1.authMiddleware);
// Validate JWT Token
router.get('/auth/validate', auth_controller_1.AuthController.isJWTTokenValid);
// Players API
router.get('/auth/players', (0, validation_middleware_1.validate)(playerValidation.updateProfileSchema, "query"), player_controller_1.PlayerController.getPlayers);
router.get('/auth/players/inactive', (0, validation_middleware_1.validate)(playerValidation.updateProfileSchema, "query"), (0, permissions_middleware_1.CheckPermission)([roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.SUPER_ADMIN]), player_controller_1.PlayerController.getInactivePlayers);
router.post('/auth/players/add', (0, validation_middleware_1.validate)(registrationValidation.addProfileSchema), (0, permissions_middleware_1.CheckPermission)([roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.SUPER_ADMIN, roles_constants_1.ROLES.ORGANISER]), registration_controller_1.RegistrationController.addPlayers);
router.put('/auth/players/:playerId/update', (0, validation_middleware_1.validate)(roleValidation.playerIdSchema, 'params'), (0, validation_middleware_1.validate)(registrationValidation.updateProfileByRoleSchema), registration_controller_1.RegistrationController.updatePlayersByRole);
router.delete('/auth/players/:playerId/delete', (0, permissions_middleware_1.CheckPermission)([roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.SUPER_ADMIN]), (0, validation_middleware_1.validate)(roleValidation.playerIdSchema, 'params'), registration_controller_1.RegistrationController.deletePlayer);
router.delete('/auth/players/deactivate', (0, permissions_middleware_1.CheckPermission)([roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.SUPER_ADMIN]), (0, validation_middleware_1.validate)(roleValidation.playerIdsSchema), registration_controller_1.RegistrationController.deactivatePlayers);
router.delete('/auth/players/nonplayer', (0, permissions_middleware_1.CheckPermission)([roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.SUPER_ADMIN, roles_constants_1.ROLES.ORGANISER]), (0, validation_middleware_1.validate)(roleValidation.playerIdsSchema), registration_controller_1.RegistrationController.updateToNonPlayers);
router.delete('/auth/players/toplayer', (0, permissions_middleware_1.CheckPermission)([roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.SUPER_ADMIN, roles_constants_1.ROLES.ORGANISER]), (0, validation_middleware_1.validate)(roleValidation.playerIdsSchema), registration_controller_1.RegistrationController.updateToPlayers);
router.post('/auth/players/import', (0, validation_middleware_1.validate)(fileValidation.AddPlayersFile), (0, permissions_middleware_1.CheckPermission)([roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.SUPER_ADMIN]), registration_controller_1.RegistrationController.AddMultiplePlayers);
router.post('/auth/players/export', (0, validation_middleware_1.validate)(roleValidation.playerIdsOptionalSchema), (0, permissions_middleware_1.CheckPermission)([roles_constants_1.ROLES.ADMIN, roles_constants_1.ROLES.SUPER_ADMIN]), player_controller_1.PlayerController.exportPlayers);
// Create/Remove Admin
router.put('/auth/players/:playerId/role/admin', (0, validation_middleware_1.validate)(roleValidation.playerIdSchema, 'params'), (0, permissions_middleware_1.CheckPermission)([roles_constants_1.ROLES.SUPER_ADMIN]), role_controller_1.RoleController.createAdmin);
router.delete('/auth/players/:playerId/role/admin/delete', (0, validation_middleware_1.validate)(roleValidation.playerIdSchema, 'params'), (0, permissions_middleware_1.CheckPermission)([roles_constants_1.ROLES.SUPER_ADMIN]), role_controller_1.RoleController.removeAdmin);
// Approved Player
router.post('/auth/players/approve', (0, validation_middleware_1.validate)(roleValidation.playerIdsSchema), (0, permissions_middleware_1.CheckPermission)([roles_constants_1.ROLES.SUPER_ADMIN, roles_constants_1.ROLES.ADMIN]), role_controller_1.RoleController.approvePlayers);
exports.default = router;
