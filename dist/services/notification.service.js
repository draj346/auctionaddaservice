"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
const notification_constants_1 = require("../constants/notification.constants");
const notification_queries_1 = require("../queries/notification.queries");
const roles_constants_1 = require("../constants/roles.constants");
class NotificationService {
    // Notifications
    static async createNotification(playerId, message, type, submittedBy, role, additionalInfo = null) {
        try {
            const [result] = await db_config_1.default.execute(notification_queries_1.NotificationQueries.createNotification, [
                playerId,
                message,
                type,
                submittedBy,
                notification_constants_1.NOTIFICATION_ROLE[role] || '',
                additionalInfo || null
            ]);
            return result.affectedRows > 0;
        }
        catch (error) {
            console.error("notification creation failed:", error);
            return false;
        }
    }
    static async batchCreateNotification(playerIds, message, type, submittedBy, role, additionalInfo = null) {
        if (playerIds.length === 0)
            return true;
        const placeholders = [];
        const values = [];
        playerIds.forEach((playerId) => {
            placeholders.push("(?, ?, ?, ?, ?, ?)");
            values.push(playerId, message, type, submittedBy, notification_constants_1.NOTIFICATION_ROLE[role], additionalInfo);
        });
        try {
            const query = notification_queries_1.NotificationQueriesFn.batchCreateNotification(placeholders.join(", "));
            await db_config_1.default.execute(query, values);
            return true;
        }
        catch (error) {
            console.error("Batch notification creation failed:", error);
            return false;
        }
    }
    static async getUserNotifications(playerId) {
        const [result] = await db_config_1.default.execute(notification_queries_1.NotificationQueries.getNotifications, [playerId]);
        return result.length > 0 ? result : [];
    }
    static async getNewNotificationsCount(playerId) {
        const [notification] = await db_config_1.default.execute(notification_queries_1.NotificationQueries.getNewNotificationsCount, [
            playerId,
        ]);
        const [pendingUpdate] = await db_config_1.default.execute(notification_queries_1.NotificationQueries.getPendingUpdateCount, [playerId]);
        let count = 0;
        if (notification.length > 0) {
            count = notification[0].total;
        }
        if (pendingUpdate.length > 0) {
            count += pendingUpdate[0].total;
        }
        return { total: count };
    }
    static async updateIsRead(playerId) {
        const [result] = await db_config_1.default.execute(notification_queries_1.NotificationQueries.updateIsRead, [true, playerId]);
        return result.affectedRows > 0;
    }
    // Pending Updates
    static async createPendingUpdate(playerId, submittedBy, updatedData, message, role, type, previousData) {
        const status = notification_constants_1.PENDING_UPDATES_STATUS.PENDING;
        const [result] = await db_config_1.default.execute(notification_queries_1.NotificationQueries.createPendingUpdate, [
            playerId,
            submittedBy,
            updatedData,
            status,
            message,
            notification_constants_1.NOTIFICATION_ROLE[role] || '',
            type,
            previousData
        ]);
        return result.affectedRows > 0;
    }
    static async getPendingUpdates(playerId) {
        const [result] = await db_config_1.default.execute(notification_queries_1.NotificationQueries.getPendingUpdate, [playerId]);
        return result.length > 0 ? result : [];
    }
    static async actionPendingUpdate(id, status, playerId, submittedBy) {
        await db_config_1.default.execute(notification_queries_1.NotificationQueries.updatePendingStatus, [status, id]);
        const [result] = await db_config_1.default.execute(notification_queries_1.NotificationQueries.pendingUpdate, [id]);
        const notifType = status === notification_constants_1.PENDING_UPDATES_STATUS.APPROVED ? notification_constants_1.NOTIFICATIONS.UPDATE_APPROVED : notification_constants_1.NOTIFICATIONS.UPDATE_REJECTED;
        const message = status === notification_constants_1.PENDING_UPDATES_STATUS.APPROVED
            ? notification_constants_1.NotificationMessage.REQUEST_APPROVED
            : notification_constants_1.NotificationMessage.REQUEST_REJECTED;
        await this.createNotification(playerId, message, notifType, submittedBy ? submittedBy : playerId, roles_constants_1.ROLES.PLAYER);
        return true;
    }
}
exports.NotificationService = NotificationService;
