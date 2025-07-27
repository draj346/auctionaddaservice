"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
const contact_queries_1 = require("../queries/contact.queries");
class ContactService {
    static async insertComment(contact) {
        const [result] = await db_config_1.default.execute(contact_queries_1.ContactQueries.insertContactMessage, [
            contact.name,
            contact.mobile,
            contact.email,
            contact.subject,
            contact.message,
        ]);
        return result.affectedRows > 0;
    }
    static async updateWorkStatus(contact) {
        const [result] = await db_config_1.default.execute(contact_queries_1.ContactQueries.updateWorkStatus, [
            true,
            contact.playerId,
            contact.id,
        ]);
        return result.affectedRows > 0;
    }
    static async getUnWorkComment() {
        const [result] = await db_config_1.default.execute(contact_queries_1.ContactQueries.getUnWorkMessage);
        return result?.length > 0 ? result : null;
    }
    static async getWorkComment() {
        const [result] = await db_config_1.default.execute(contact_queries_1.ContactQueries.getWorkMessage);
        return result?.length > 0 ? result : null;
    }
}
exports.ContactService = ContactService;
