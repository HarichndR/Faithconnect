const mongoose = require("mongoose");

const conferenceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Conference title is required"],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        leader: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["planned", "live", "ended"],
            default: "planned",
        },
        thumbnailUrl: {
            type: String,
        },
        startTime: {
            type: Date,
            default: Date.now,
        },
        roomId: {
            type: String,
            unique: true,
            required: true,
        },
        viewers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }]
    },
    { timestamps: true }
);

module.exports = mongoose.model("Conference", conferenceSchema);
