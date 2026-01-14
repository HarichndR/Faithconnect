const Notification = require("../models/notification.model");
const User = require("../models/user.model");

/**
 * Sends a notification to a specific user via:
 * 1. In-app Socket.io event (Real-time)
 * 2. Database record (Persistent)
 * 3. Mobile Push Notification (FCM Placeholder)
 */
exports.sendNotification = async ({
    recipient,
    sender = null,
    type,
    title,
    message,
    data = {},
}) => {
    try {
        if (!recipient || !type || !title || !message) return;

        // 1. Create Database Record
        const notification = await Notification.create({
            recipient,
            sender,
            type,
            title,
            message,
            data,
        });

        // 2. Clear out IDs if any for socket emission
        const payload = {
            id: notification._id,
            type,
            title,
            message,
            data,
            createdAt: notification.createdAt,
        };

        // 3. Emit via Socket.io for In-App feedback
        if (global.io) {
            // Find socket by user ID
            const sockets = await global.io.fetchSockets();
            const userSocket = sockets.find(s => s.userId === recipient.toString());
            if (userSocket) {
                userSocket.emit("notification", payload);
            }
        }

        // 4. Send Mobile Push (FCM Logic Placeholder)
        // You would typically fetch the user's deviceTokens here
        const user = await User.findById(recipient).select("deviceTokens");
        if (user && user.deviceTokens && user.deviceTokens.length > 0) {
            // Logic to send through firebase-admin:
            // admin.messaging().sendMulticast({
            //   tokens: user.deviceTokens,
            //   notification: { title, body: message },
            //   data: { ...data, type }
            // });
            console.log(`[PUSH] Sending to ${user.deviceTokens.length} devices for user ${recipient}`);
        }

        return notification;
    } catch (err) {
        console.error("Notification Error:", err);
    }
};

/**
 * Sends a notification to many users (e.g. followers)
 */
exports.notifyMany = async (userIds, payload) => {
    return Promise.all(userIds.map(id => exports.sendNotification({ ...payload, recipient: id })));
};