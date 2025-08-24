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
        const fullMatchQuery = data.email ? registration_queries_1.RegistrationQueries.findFullMatch : registration_queries_1.RegistrationQueries.findFullMatchWithNull;
        const fullMatchData = data.email ? [data.mobile, data.email, data.name] : [data.mobile, data.name];
        const [fullMatches] = await db_config_1.default.execute(fullMatchQuery, fullMatchData);
        if (fullMatches.length > 0) {
            const player = fullMatches[0];
            return {
                ...(player.isSubmitted !== 1 && { playerId: player.playerId }),
                isRegistered: player.isSubmitted === 1,
            };
        }
        let duplicateMobile = false;
        let duplicateEmail = false;
        const [mobileMatches] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.findPlayerByMobile, [data.mobile]);
        if (mobileMatches.length > 0) {
            if (mobileMatches[0].isSubmitted === 1) {
                return { playerId: mobileMatches[0].playerId };
            }
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
        const [result] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.insertPlayer, [
            data.name,
            data.mobile,
            data.email || null,
            data.state || null,
            data.district || null,
        ]);
        return {
            playerId: result.insertId,
        };
    }
    async addPlayerInformation(data) {
        const [result] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.addPlayerInformation, [
            data.playerId,
            data.jerseyNumber || null,
            data.tShirtSize || null,
            data.lowerSize || null,
            data.hasCricheroesProfile === undefined ? null : data.hasCricheroesProfile,
            data.isPaidPlayer === undefined ? null : data.isPaidPlayer,
            data.pricePerMatch || null,
            data.willJoinAnyOwner === undefined ? null : data.willJoinAnyOwner,
            data.playerRole || null,
            data.battingStyle || null,
            data.bowlingStyle || null,
            data.description || null
        ]);
        if (result.affectedRows > 0) {
            if (data.image) {
                await db_config_1.default.execute(registration_queries_1.RegistrationQueries.updateImage, [data.playerId, data.image, data.image]);
            }
            const [isSubmittedResult] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.setPlayerSubmitted, [true, data.playerId]);
            if (isSubmittedResult.affectedRows === 0) {
                await db_config_1.default.execute(registration_queries_1.RegistrationQueries.deletePlayerInformation, [data.playerId]);
                return false;
            }
            return true;
        }
        return false;
    }
    async updateProfile(data) {
        const [result] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.updatePlayerInformation, [
            data.playerId,
            data.jerseyNumber || null,
            data.tShirtSize || null,
            data.lowerSize || null,
            data.hasCricheroesProfile === undefined ? null : data.hasCricheroesProfile,
            data.isPaidPlayer === undefined ? null : data.isPaidPlayer,
            data.pricePerMatch || null,
            data.willJoinAnyOwner === undefined ? null : data.willJoinAnyOwner,
            data.playerRole || null,
            data.battingStyle || null,
            data.bowlingStyle || null,
            data.description || null
        ]);
        if (result.affectedRows > 0) {
            if (data.image) {
                await db_config_1.default.execute(registration_queries_1.RegistrationQueries.updateImage, [data.playerId, data.image]);
            }
            const [isSubmittedResult] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.updatePlayerAddress, [
                data.state || null,
                data.district || null,
                data.playerId,
            ]);
            if (isSubmittedResult.affectedRows === 0) {
                await db_config_1.default.execute(registration_queries_1.RegistrationQueries.deletePlayerInformation, [data.playerId]);
                return false;
            }
            return true;
        }
        return false;
    }
    async isUserProfileSubmitted(playerId) {
        const [result] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.findNotRegisteredUserById, [playerId]);
        return result?.length > 0 ? result[0].count === 1 : false;
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
            data.state || null,
            data.district || null,
            true,
        ]);
        if (result.affectedRows > 0) {
            await db_config_1.default.execute(registration_queries_1.RegistrationQueries.addPlayerInformation, [
                result.insertId,
                data.jerseyNumber || null,
                data.tShirtSize || null,
                data.lowerSize || null,
                data.hasCricheroesProfile === undefined ? null : data.hasCricheroesProfile,
                data.isPaidPlayer === undefined ? null : data.isPaidPlayer,
                data.pricePerMatch || null,
                data.willJoinAnyOwner === undefined ? null : data.willJoinAnyOwner,
                data.playerRole || null,
                data.battingStyle || null,
                data.bowlingStyle || null,
                data.description || null
            ]);
            return {
                playerId: result.insertId,
            };
        }
        return {
            playerId: 0,
        };
    }
    async deleteProfile(playerId) {
        const [result] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.deletePlayer, [playerId]);
        return result.affectedRows > 0;
    }
    async deactivatePlayers(playerIds) {
        const [result] = await db_config_1.default.execute(registration_queries_1.MultiUserRegistrationQueries.deactivatePlayers(playerIds.join()));
        return result.affectedRows > 0;
    }
    async activatePlayers(playerIds) {
        const [result] = await db_config_1.default.execute(registration_queries_1.MultiUserRegistrationQueries.activatePlayers(playerIds.join()));
        return result.affectedRows > 0;
    }
    async updateToNonPlayers(playerIds) {
        const [result] = await db_config_1.default.execute(registration_queries_1.MultiUserRegistrationQueries.updateToNonPlayers(playerIds.join()));
        return result.affectedRows > 0;
    }
    async updateToPlayers(playerIds) {
        const [result] = await db_config_1.default.execute(registration_queries_1.MultiUserRegistrationQueries.updateToPlayers(playerIds.join()));
        return result.affectedRows > 0;
    }
    async createProfileForExcel(data) {
        if (data["Email"]) {
            const [fullMatches] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.findFullMatch, [
                data["Mobile"],
                data["Email"],
                data["Full Name"],
            ]);
            if (fullMatches.length > 0) {
                throw new Error("Mobile, Email and Name already exists");
            }
        }
        const [mobileMatches] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.findPlayerByMobile, [data["Mobile"]]);
        if (mobileMatches.length > 0) {
            throw new Error("Mobile number already exists");
        }
        if (data["Email"]) {
            const [emailMatches] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.findPlayerByEmail, [data["Email"]]);
            if (emailMatches.length > 0) {
                throw new Error("Email already exists");
            }
        }
        const [result] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.createPlayer, [
            data["Full Name"],
            data["Mobile"],
            data["Email"] || null,
            data["State"] || null,
            data["District"] || null,
            true,
        ]);
        if (result.affectedRows > 0) {
            await db_config_1.default.execute(registration_queries_1.RegistrationQueries.updatePlayerInformation, [
                result.insertId,
                data["Jersey Number"] || null,
                data["T-Shirt Size"] || null,
                data["Lower Size"] || null,
                data["Has Cricheroes Profile"] === undefined ? null : data["Has Cricheroes Profile"],
                data["Is Paid Player"] === undefined ? null : data["Is Paid Player"],
                data["Price Per Match"] || null,
                data["Will Join Any Owner"] === undefined ? null : data["Will Join Any Owner"],
                data["Player Role"] || null,
                data["Batting Style"] || null,
                data["Bowling Style"] || null,
                data["Description"] || null,
            ]);
            return {
                playerId: result.insertId,
            };
        }
        throw new Error("Something happend. Please Try again for this player");
    }
    async updateImageId(fileId, playerId) {
        const [result] = await db_config_1.default.execute(registration_queries_1.RegistrationQueries.updateImage, [playerId, fileId, fileId]);
        return result.affectedRows > 0;
    }
}
exports.RegistrationService = RegistrationService;
