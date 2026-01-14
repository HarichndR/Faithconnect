const ResponseUtil = require("../utils/response.util");
const User = require("../models/user.model");
const AppError = require("../utils/AppError.util");
const { HTTP_STATUS, NOTIFICATION_TYPES } = require("../constants");
const { sendNotification } = require('../utils/sendNotification.util')

exports.getChatCandidates = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId)
            .select("role followers following")
            .populate(
                req.user.role === "LEADER" ? "followers" : "following",
                "name profilePhoto"
            );

        const users =
            req.user.role === "LEADER"
                ? user.followers
                : user.following;

        res.status(200).json({
            status: "success",
            data: users,
        });
    } catch (err) {
        next(err);
    }
};

exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId).select(
            "name email role faith bio profilePhoto followers following deviceTokens createdAt updatedAt"
        );

        if (!user) {
            return next(new AppError("User not found", HTTP_STATUS.NOT_FOUND));
        }

        ResponseUtil.success(res, user, "Current user profile");
    } catch (err) {
        next(err);
    }
};

const uploadToCloudinary = require('../utils/cloudeneryUploader');

exports.updateMe = async (req, res, next) => {
    try {
        const update = {};

        if (req.body.name !== undefined) update.name = req.body.name;
        if (req.body.bio !== undefined) update.bio = req.body.bio;
        if (req.body.faith !== undefined) update.faith = req.body.faith;

        if (req.file) {
            const upload = await uploadToCloudinary(
                req.file.buffer,
                "profiles",
                "image"
            );
            update.profilePhoto = upload.secure_url;
        }

        const user = await User.findByIdAndUpdate(req.user.userId, update, {
            new: true,
        }).select(
            "name email role faith bio profilePhoto followers following deviceTokens createdAt updatedAt"
        );

        if (!user) {
            return next(new AppError("User not found", HTTP_STATUS.NOT_FOUND));
        }

        ResponseUtil.success(res, user, "Profile updated");
    } catch (err) {
        next(err);
    }
};

exports.registerDeviceToken = async (req, res, next) => {
    try {
        const { token } = req.body;

        if (!token) {
            return next(
                new AppError("Device token is required", HTTP_STATUS.BAD_REQUEST)
            );
        }

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            {
                $addToSet: { deviceTokens: token },
            },
            { new: true }
        ).select("deviceTokens");

        if (!user) {
            return next(new AppError("User not found", HTTP_STATUS.NOT_FOUND));
        }

        ResponseUtil.success(res, user, "Device token registered");
    } catch (err) {
        next(err);
    }
};

exports.getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = id === "me" ? req.user.userId : id;

        const user = await User.findById(userId)
            .select("name email role faith bio profilePhoto followers following deviceTokens createdAt updatedAt")
            .populate("followers", "name profilePhoto faith")
            .populate("following", "name profilePhoto faith");

        if (!user) {
            return next(new AppError("User not found", HTTP_STATUS.NOT_FOUND));
        }

        ResponseUtil.success(res, user, "User profile");
    } catch (err) {
        next(err);
    }
};

exports.getUserFollowers = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = id === "me" ? req.user.userId : id;

        const user = await User.findById(userId)
            .select("followers")
            .populate("followers", "name profilePhoto faith bio");

        if (!user) {
            return next(new AppError("User not found", HTTP_STATUS.NOT_FOUND));
        }

        ResponseUtil.success(res, user.followers || [], "User followers");
    } catch (err) {
        next(err);
    }
};


exports.followLeader = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const leaderId = req.params.id;

        if (userId === leaderId) {
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

        const follower = await User.findById(userId).select("name");
        sendNotification({
            recipient: leaderId,
            sender: userId,
            type: NOTIFICATION_TYPES.FOLLOW,
            title: "New Follower",
            message: `${follower?.name || "A user"} started following you!`,
            data: { followerId: userId },
        });
        res.status(200).json({ success: true });
    } catch (err) {
        next(err);
    }
};

exports.unfollowLeader = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const leaderId = req.params.id;

        await User.findByIdAndUpdate(userId, {
            $pull: { following: leaderId },
        });

        await User.findByIdAndUpdate(leaderId, {
            $pull: { followers: userId },
        });

        sendNotification({
            recipient: leaderId,
            sender: null,
            type: NOTIFICATION_TYPES.FOLLOW,
            title: "Follower Update",
            message: "A user stopped following you.",
            data: {},
        });

        res.status(200).json({ success: true });
    } catch (err) {
        next(err);
    }
}