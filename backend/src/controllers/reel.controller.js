const ResponseUtil = require("../utils/response.util");
const AppError = require("../utils/AppError.util");
const { HTTP_STATUS, ROLES } = require("../constants");
const Reel = require("../models/reel.model");
const User = require("../models/user.model");
const uploadToCloudinary = require('../utils/cloudeneryUploader');
/* ======================================================
   CREATE REEL (LEADER ONLY)
====================================================== */
/* ======================================================
   CREATE REEL (LEADER ONLY) + NOTIFY FOLLOWERS
====================================================== */


const { sendNotification, notifyMany } = require("../utils/sendNotification.util");

exports.createReel = async (req, res, next) => {
    try {
        if (req.user.role !== ROLES.LEADER) {
            return next(new AppError("Only leaders can create reels", 403));
        }
        console.log("REQ FILE EXISTS:", !!req.file);
        console.log("FILE SIZE:", req.file?.buffer?.length);

        if (!req.file) {
            return next(new AppError("Reel video is required", 400));
        }

        const upload = await uploadToCloudinary(
            req.file.buffer,
            "reels",
            "video"
        );

        // Generate thumbnailUrl from Cloudinary secure_url
        // Cloudinary allows getting a thumbnail by changing the extension and adding so_0 (start offset 0)
        let thumbnailUrl = null;
        if (upload.secure_url) {
            thumbnailUrl = upload.secure_url.replace(/\.[^/.]+$/, ".jpg").replace("/upload/", "/upload/so_0/");
        }

        const reel = await Reel.create({
            author: req.user.userId,
            caption: req.body.caption,
            videoUrl: upload.secure_url,
            thumbnailUrl: thumbnailUrl,
        });

        const populated = await reel.populate(
            "author",
            "name profilePhoto faith role"
        );

        // 🔔 Notify all followers
        const authorUser = await User.findById(req.user.userId).select("followers");
        if (authorUser && authorUser.followers.length > 0) {
            notifyMany(authorUser.followers, {
                sender: req.user.userId,
                type: NOTIFICATION_TYPES.NEW_POST,
                title: "New Reel from Leader",
                message: `${populated.author.name} shared a new reel!`,
                data: { reelId: reel._id, type: "REEL" }
            });
        }

        ResponseUtil.success(res, populated, "Reel created", 201);
    } catch (err) {
        next(err);
    }
};

/* ======================================================
   EXPLORE REELS
====================================================== */
exports.getExploreReels = async (req, res, next) => {
    try {
        const limit = Math.min(Number(req.query.limit) || 20, 50);
        const offset = Math.max(Number(req.query.offset) || 0, 0);

        const reels = await Reel.find({})
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .populate("author", "name profilePhoto faith role");

        ResponseUtil.success(res, reels, "Explore reels");
    } catch (err) {
        next(err);
    }
};

/* ======================================================
   FOLLOWING REELS
====================================================== */
exports.getFollowingReels = async (req, res, next) => {
    try {
        const me = await User.findById(req.user.userId).select("following");
        if (!me) {
            return next(new AppError("User not found", HTTP_STATUS.NOT_FOUND));
        }

        const limit = Math.min(Number(req.query.limit) || 20, 50);
        const offset = Math.max(Number(req.query.offset) || 0, 0);

        const reels = await Reel.find({ author: { $in: me.following } })
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .populate("author", "name profilePhoto faith role");

        ResponseUtil.success(res, reels, "Following reels");
    } catch (err) {
        next(err);
    }
};

/* ======================================================
   MY REELS
====================================================== */
exports.getMyReels = async (req, res, next) => {
    try {
        const reels = await Reel.find({ author: req.user.userId })
            .sort({ createdAt: -1 })
            .populate("author", "name profilePhoto faith role");
        ResponseUtil.success(res, reels, "My reels");
    } catch (err) {
        next(err);
    }
};

/* ======================================================
   GET USER REELS (PUBLIC)
====================================================== */
exports.getUserReels = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const reels = await Reel.find({ author: userId })
            .sort({ createdAt: -1 })
            .populate("author", "name profilePhoto faith role");

        ResponseUtil.success(res, reels, "User reels");
    } catch (err) {
        next(err);
    }
};

/* ======================================================
   TOGGLE LIKE
====================================================== */
exports.toggleLike = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const reel = await Reel.findById(id);
        if (!reel) {
            return next(new AppError("Reel not found", HTTP_STATUS.NOT_FOUND));
        }

        const alreadyLiked = reel.likes.includes(userId);

        if (alreadyLiked) {
            reel.likes.pull(userId);
        } else {
            reel.likes.addToSet(userId);
        }

        await reel.save();

        // 🔔 Notify Author if it's a new like
        if (!alreadyLiked && reel.author.toString() !== userId.toString()) {
            const liker = await User.findById(userId).select("name");
            sendNotification({
                recipient: reel.author,
                sender: userId,
                type: NOTIFICATION_TYPES.LIKE,
                title: "Reel Liked",
                message: `${liker?.name || "Someone"} liked your reel!`,
                data: { reelId: reel._id }
            });
        }

        ResponseUtil.success(res, {
            liked: !alreadyLiked,
            likesCount: reel.likes.length,
        });
    } catch (err) {
        next(err);
    }
};

/* ======================================================
   TOGGLE SAVE
====================================================== */
exports.toggleSave = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const reel = await Reel.findById(id);
        if (!reel) {
            return next(new AppError("Reel not found", HTTP_STATUS.NOT_FOUND));
        }

        const alreadySaved = reel.saves.includes(userId);

        if (alreadySaved) {
            reel.saves.pull(userId);
        } else {
            reel.saves.addToSet(userId);
        }

        await reel.save();

        ResponseUtil.success(res, {
            saved: !alreadySaved,
            savesCount: reel.saves.length,
        });
    } catch (err) {
        next(err);
    }
};

/* ======================================================
   CREATE COMMENT
====================================================== */
exports.createComment = async (req, res, next) => {
    try {
        const { reelId, comment } = req.body;

        if (!reelId || !comment) {
            return next(
                new AppError("Missing required fields", HTTP_STATUS.BAD_REQUEST)
            );
        }

        const reel = await Reel.findById(reelId);
        if (!reel) {
            return next(new AppError("Reel not found", HTTP_STATUS.NOT_FOUND));
        }

        reel.comments.push({
            comment,
            userId: req.user.userId,
        });

        await reel.save();
        await reel.populate("comments.userId", "name profilePhoto");

        ResponseUtil.success(
            res,
            reel.comments,
            "Comment posted",
            HTTP_STATUS.CREATED
        );
    } catch (err) {
        next(err);
    }
};

/* ======================================================
   GET REEL COMMENTS
====================================================== */
exports.getReelComments = async (req, res, next) => {
    try {
        const { id } = req.params;

        const reel = await Reel.findById(
            id,
            { comments: 1, _id: 0 }
        ).populate("comments.userId", "name profilePhoto");

        if (!reel) {
            return next(new AppError("Reel not found", HTTP_STATUS.NOT_FOUND));
        }

        ResponseUtil.success(res, reel.comments || []);
    } catch (err) {
        next(err);
    }
};

exports.getSavedReels = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const reels = await Reel.find({
            saves: userId,
        })
            .sort({ createdAt: -1 })
            .populate("author", "name profilePhoto faith role");

        ResponseUtil.success(res, reels, "Saved reels");
    } catch (err) {
        next(err);
    }
};

exports.getLikedReels = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const reels = await Reel.find({
            likes: userId,
        })
            .sort({ createdAt: -1 })
            .populate("author", "name profilePhoto faith role");

        ResponseUtil.success(res, reels, "Liked reels");
    } catch (err) {
        next(err);
    }
};
