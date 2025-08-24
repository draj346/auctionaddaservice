"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonService = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
const common_queries_1 = require("../queries/common.queries");
class CommonService {
    static async getBanner() {
        const [result] = await db_config_1.default.execute(common_queries_1.CommonQueries.getBanner);
        return result?.length > 0 ? result : null;
    }
    static async getDiscount() {
        const [result] = await db_config_1.default.execute(common_queries_1.CommonQueries.getDiscount);
        return result?.length > 0 ? result : null;
    }
    static async getYoutubes() {
        const [result] = await db_config_1.default.execute(common_queries_1.CommonQueries.getVideos);
        return result?.length > 0 ? result : null;
    }
}
exports.CommonService = CommonService;
