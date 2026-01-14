const mongoose = require("mongoose");
const { NOTIFICATION_TYPES } = require("../constants");

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        type: {
            type: String,
            required: true,
        },

        title: {
            type: String,
            required: true,
        },

        message: {
            type: String,
            required: true,
        },

        data: {
            type: Object,
            default: {},
        },

        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },

        entityId: {
            type: mongoose.Schema.Types.ObjectId,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
