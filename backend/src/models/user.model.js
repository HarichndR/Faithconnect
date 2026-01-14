const mongoose = require("mongoose");
const { ROLES, FAITHS } = require("../constants");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            select: false,
        },

        role: {
            type: String,
            enum: Object.values(ROLES),
            required: true,
        },

        faith: {
            type: String,

            required: true,
        },

        profilePhoto: {
            type: String,
            default: null,
        },

        deviceTokens: {
            // Expo push tokens or device identifiers for notifications
            type: [String],
            default: [],
        },

        bio: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },

        // Worshiper following leaders, and leaders' followers
        followers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        following: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

    },


    { timestamps: true }
);



// Use explicit collection name to avoid collision with existing `users` collection
module.exports = mongoose.model("User", userSchema, "faithappuser");
