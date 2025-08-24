"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionsHelper = void 0;
class AuctionsHelper {
    static generateAuctionCode(auctionId, name, role) {
        const nameInitial = name[Math.floor(Math.random() * name.length)].toUpperCase();
        const secondNameInitial = name[Math.floor(Math.random() * name.length)].toUpperCase();
        const roleInitial = role[Math.floor(Math.random() * role.length)].toUpperCase();
        return roleInitial + nameInitial + auctionId.toString() + secondNameInitial;
    }
    static getNotificationJSON(name, state, code, categoryName, fullName) {
        const result = {};
        if (name) {
            result.name = name;
        }
        if (categoryName) {
            result.categoryName = categoryName;
        }
        if (state) {
            result.state = state;
        }
        if (code) {
            result.code = code;
        }
        if (fullName) {
            result.fullName = fullName;
        }
        return result;
    }
}
exports.AuctionsHelper = AuctionsHelper;
