const Notification = require("../models/notification.model");
const ResponseUtil = require("../utils/response.util");
const AppError = require("../utils/AppError.util");
const { HTTP_STATUS } = require("../constants");

/* ---------------- CREATE (INTERNAL USE) ---------------- */
exports.createNotification = async ({
    recipient,
    sender = null,
    type,
    title,
    message,
    data = {},
}) => {
    if (!recipient || !type || !title || !message) return;

    return Notification.create({
        recipient,
        sender,
        type,
        title,
        message,
        data,
    });
};

/* ---------------- GET MY NOTIFICATIONS ---------------- */
exports.getMyNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({
            recipient: req.user.userId,
        })
            .populate("sender", "name profilePhoto role")
            .sort({ createdAt: -1 })
            .limit(50);

        ResponseUtil.success(res, notifications, "Notifications fetched");
    } catch (err) {
        next(err);
    }
};

/* ---------------- MARK AS READ ---------------- */
exports.markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient: req.user.userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return next(new AppError("Notification not found", HTTP_STATUS.NOT_FOUND));
        }

        ResponseUtil.success(res, notification, "Marked as read");
    } catch (err) {
        next(err);
    }
};

/* ---------------- MARK ALL AS READ ---------------- */
exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.userId, isRead: false },
            { isRead: true }
        );

        ResponseUtil.success(res, null, "All notifications marked as read");
    } catch (err) {
        next(err);
    }
};

/* ---------------- DELETE ---------------- */
exports.deleteNotification = async (req, res, next) => {
    try {
        const { id } = req.params;

        const deleted = await Notification.findOneAndDelete({
            _id: id,
            recipient: req.user.userId,
        });

        if (!deleted) {
            return next(new AppError("Notification not found", HTTP_STATUS.NOT_FOUND));
        }

        ResponseUtil.success(res, null, "Notification deleted");
    } catch (err) {
        next(err);
    }
};
