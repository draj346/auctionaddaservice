"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationService = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
const registration_queries_1 = require("../queries/registration.queries");
class RegistrationService {
    async initialRegistration(data) {
        if (data.email) {
            const [fullMatches] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.findFullMatch, [data.mobile, data.email, data.name]);
            if (fullMatches.length > 0) {
                const player = fullMatches[0];
                return {
                    ...(player.isSubmitted !== 1 && { playerId: player.playerId }),
                    isRegistered: player.isSubmitted === 1,
                };
            }
        }
        let duplicateMobile = false;
        let duplicateEmail = false;
        const [mobileMatches] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.findPlayerByMobile, [data.mobile]);
        if (mobileMatches.length > 0) {
            duplicateMobile = true;
        }
        if (data.email) {
            const [emailMatches] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.findPlayerByEmail, [data.email]);
            if (emailMatches.length > 0) {
                duplicateEmail = true;
            }
        }
        if (duplicateMobile || duplicateEmail) {
            return {
                ...(duplicateMobile && { duplicateMobile: true }),
                ...(duplicateEmail && { duplicateEmail: true }),
            };
        }
        const [result] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.insertPlayer, [data.name, data.mobile, data.email || null]);
        return {
            playerId: result.insertId,
        };
    }
    async updateProfile(data) {
        const [result] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.updatePlayer, [
            data.name,
            data.jerseyNumber || null,
            data.tShirtSize || null,
            data.lowerSize || null,
            data.hasCricheroesProfile === undefined ? null : data.hasCricheroesProfile,
            data.isPaidPlayer === undefined ? null : data.isPaidPlayer,
            data.pricePerMatch || null,
            data.willJoinAnyOwner === undefined ? null : data.willJoinAnyOwner,
            data.image || null,
            true,
            data.playerId,
        ]);
        return result.affectedRows > 0;
    }
    async createProfile(data) {
        if (data.email) {
            const [fullMatches] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.findFullMatch, [data.mobile, data.email, data.name]);
            if (fullMatches.length > 0) {
                return {
                    isRegistered: true,
                };
            }
        }
        let duplicateMobile = false;
        let duplicateEmail = false;
        const [mobileMatches] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.findPlayerByMobile, [data.mobile]);
        if (mobileMatches.length > 0) {
            duplicateMobile = true;
        }
        if (data.email) {
            const [emailMatches] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.findPlayerByEmail, [data.email]);
            if (emailMatches.length > 0) {
                duplicateEmail = true;
            }
        }
        if (duplicateMobile || duplicateEmail) {
            return {
                ...(duplicateMobile && { duplicateMobile: true }),
                ...(duplicateEmail && { duplicateEmail: true }),
            };
        }
        const [result] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.createPlayer, [
            data.name,
            data.mobile,
            data.email || null,
            data.jerseyNumber || null,
            data.tShirtSize || null,
            data.lowerSize || null,
            data.hasCricheroesProfile === undefined ? null : data.hasCricheroesProfile,
            data.isPaidPlayer === undefined ? null : data.isPaidPlayer,
            data.pricePerMatch || null,
            data.willJoinAnyOwner === undefined ? null : data.willJoinAnyOwner,
            data.image || null,
            true,
        ]);
        return {
            playerId: result.insertId,
        };
    }
    async deleteProfile(playerId) {
        const [result] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.deletePlayer, [playerId]);
        return result.affectedRows > 0;
    }
    async deactivatePlayers(playerIds) {
        const [result] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.deactivatePlayers(playerIds.join()));
        return result.affectedRows > 0;
    }
    async updateToNonPlayers(playerIds) {
        const [result] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.updateToNonPlayers(playerIds.join()));
        return result.affectedRows > 0;
    }
    async updateToPlayers(playerIds) {
        const [result] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.updateToPlayers(playerIds.join()));
        return result.affectedRows > 0;
    }
    async createProfileForExcel(data) {
        if (data['Email']) {
            const [fullMatches] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.findFullMatch, [data['Mobile'], data['Email'], data['Full Name']]);
            if (fullMatches.length > 0) {
                throw new Error("Mobile, Email and Name already exists");
            }
        }
        const [mobileMatches] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.findPlayerByMobile, [data['Mobile']]);
        if (mobileMatches.length > 0) {
            throw new Error("Mobile number already exists");
        }
        if (data['Email']) {
            const [emailMatches] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.findPlayerByEmail, [data['Email']]);
            if (emailMatches.length > 0) {
                throw new Error("Email already exists");
            }
        }
        const [result] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.createPlayer, [
            data['Full Name'],
            data['Mobile'],
            data['Email'] || null,
            data['Jersey Number'] || null,
            data['T-Shirt Size'] || null,
            data['Lower Size'] || null,
            data['Has Cricheroes Profile'] === undefined ? null : data['Has Cricheroes Profile'],
            data['Is Paid Player'] === undefined ? null : data['Is Paid Player'],
            data['Price Per Match'] || null,
            data['Will Join Any Owner'] === undefined ? null : data['Will Join Any Owner'],
            null,
            true,
        ]);
        return {
            playerId: result.insertId,
        };
    }
}
exports.RegistrationService = RegistrationService;
