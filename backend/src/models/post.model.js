const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            trim: true,
            maxlength: 140,
        },
        text: {
            type: String,
            trim: true,
            maxlength: 2000,
        },
        mediaUrl: {
            type: String,
            default: null,
        },
        mediaType: {
            type: String,
            enum: ["IMAGE", "VIDEO", null],
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
            userId: { type: mongoose.Schema.ObjectId, ref: "User" }
        }]
    },


    { timestamps: true }
);

postSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);

