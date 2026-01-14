const ResponseUtil = require("../utils/response.util");
const AppError = require("../utils/AppError.util");
const { HTTP_STATUS } = require("../constants");
const Notification = require("../models/notification.model");

exports.listNotifications = async (req, res, next) => {
    try {
        const { limit = 30, offset = 0 } = req.query;

        const notifications = await Notification.find({
            recipient: req.user.userId,
        })
            .sort({ createdAt: -1 })
            .skip(Number(offset))
            .limit(Number(limit))
            .populate("sender", "name profilePhoto role");

        ResponseUtil.success(res, notifications, "Notifications");
    } catch (err) {
        next(err);
    }
};

exports.markAllRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.userId, isRead: false },
            { $set: { isRead: true } }
        );

        ResponseUtil.success(res, null, "All notifications marked as read");
    } catch (err) {
        next(err);
    }
};

exports.markRead = async (req, res, next) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient: req.user.userId },
            { $set: { isRead: true } },
            { new: true }
        );

        if (!notification) {
            return next(
                new AppError("Notification not found", HTTP_STATUS.NOT_FOUND)
            );
        }

        ResponseUtil.success(res, notification, "Notification marked as read");
    } catch (err) {
        next(err);
    }
};

