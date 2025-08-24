"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonController = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const common_service_1 = require("../services/common.service");
class CommonController {
}
exports.CommonController = CommonController;
_a = CommonController;
CommonController.getBanner = async (req, res) => {
    try {
        const bannerResponse = await common_service_1.CommonService.getBanner();
        if (bannerResponse) {
            apiResponse_1.ApiResponse.success(res, bannerResponse, 200, "Banner retrieve successfully!!");
        }
        else {
            apiResponse_1.ApiResponse.success(res, [], 200, "Something went happen. Please try again.");
        }
    }
    catch (error) {
        console.error(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
CommonController.getDiscount = async (req, res) => {
    try {
        const discountResponse = await common_service_1.CommonService.getDiscount();
        if (discountResponse) {
            apiResponse_1.ApiResponse.success(res, discountResponse, 200, "Discount retrieve successfully!!");
        }
        else {
            apiResponse_1.ApiResponse.success(res, [], 200, "Something went happen. Please try again.");
        }
    }
    catch (error) {
        console.error(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
CommonController.getYoutubeVideos = async (req, res) => {
    try {
        const youtubeResponse = await common_service_1.CommonService.getYoutubes();
        if (youtubeResponse) {
            apiResponse_1.ApiResponse.success(res, youtubeResponse, 200, "Videos retrieve successfully!!");
        }
        else {
            apiResponse_1.ApiResponse.success(res, [], 200, "Something went happen. Please try again.");
        }
    }
    catch (error) {
        console.error(error);
        apiResponse_1.ApiResponse.error(res, "Something went happen. Please try again.", 500, { isError: true });
    }
};
