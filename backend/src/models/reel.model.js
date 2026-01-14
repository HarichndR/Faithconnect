const mongoose = require("mongoose");

const reelSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        caption: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        videoUrl: {
            type: String,
            required: true,
        },
        thumbnailUrl: {
            type: String,
            default: null,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        saves: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        comments: [{
            comment: { type: String },
            createdAt: { type: Date, default: Date.now() },
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
        }]

    },
    { timestamps: true }
);

reelSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model("Reel", reelSchema);

