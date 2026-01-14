const ResponseUtil = require("../utils/response.util");
const userService = require("../services/auth.service");
const { HTTP_STATUS } = require("../constants");

exports.register = async (req, res, next) => {
    try {
        const data = await userService.register(req.body, req.file);
        ResponseUtil.success(res, data, "Registration successful", HTTP_STATUS.CREATED);
    } catch (err) {
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const data = await userService.login(req.body);
        ResponseUtil.success(res, data, "Login successful", HTTP_STATUS.OK);
    } catch (err) {
        next(err);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const data = await userService.updateProfile(
            req.user.userId,
            req.body,
            req.file
        );
        ResponseUtil.success(res, data, "Profile updated");
    } catch (err) {
        next(err);
    }
};

exports.getMe = async (req, res, next) => {
    try {
        const user = await userService.getMe(req.user.userId);
        ResponseUtil.success(res, user, "User details fetched");
    } catch (err) {
        next(err);
    }
};
