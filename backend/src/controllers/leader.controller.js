const ResponseUtil = require("../utils/response.util");
const AppError = require("../utils/AppError.util");
const { HTTP_STATUS, ROLES } = require("../constants");
const User = require("../models/user.model");

exports.listLeaders = async (req, res, next) => {
    try {
        const { search, faith, limit = 20, offset = 0 } = req.query;

        const filter = { role: ROLES.LEADER };

        if (faith) {
            filter.faith = faith;
        }

        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }

        const leaders = await User.find(filter)
            .sort({ createdAt: -1 })
            .skip(Number(offset))
            .limit(Number(limit))
            .select("name bio faith profilePhoto followers");

        ResponseUtil.success(res, leaders, "Leaders list");
    } catch (err) {
        next(err);
    }
};

exports.followLeader = async (req, res, next) => {
    try {
        const leaderId = req.params.id;
        const userId = req.user.userId;

        const leader = await User.findOne({
            _id: leaderId,
            role: ROLES.LEADER,
        });
        if (!leader) {
            return next(
                new AppError("Leader not found", HTTP_STATUS.NOT_FOUND)
            );
        }

        if (leaderId === userId.toString()) {
            return next(
                new AppError("You cannot follow yourself", HTTP_STATUS.BAD_REQUEST)
            );
        }

        await User.findByIdAndUpdate(userId, {
            $addToSet: { following: leaderId },
        });

        await User.findByIdAndUpdate(leaderId, {
            $addToSet: { followers: userId },
        });

        ResponseUtil.success(res, null, "Leader followed");
    } catch (err) {
        next(err);
    }
};

exports.unfollowLeader = async (req, res, next) => {
    try {
        const leaderId = req.params.id;
        const userId = req.user.userId;

        const leader = await User.findOne({
            _id: leaderId,
            role: ROLES.LEADER,
        });
        if (!leader) {
            return next(
                new AppError("Leader not found", HTTP_STATUS.NOT_FOUND)
            );
        }

        await User.findByIdAndUpdate(userId, {
            $pull: { following: leaderId },
        });

        await User.findByIdAndUpdate(leaderId, {
            $pull: { followers: userId },
        });

        ResponseUtil.success(res, null, "Leader unfollowed");
    } catch (err) {
        next(err);
    }
};

