const ResponseUtil = require("../utils/response.util");
const AppError = require("../utils/AppError.util");
const { HTTP_STATUS, ROLES } = require("../constants");
const Post = require("../models/post.model");
const User = require("../models/user.model");
const cloudinary = require("../config/cloudinary");
const sendNotification = require("../utils/sendNotification.util");
const { NOTIFICATION_TYPES } = require("../constants");


const uploadToCloudinary = require('../utils/cloudeneryUploader');


exports.createPost = async (req, res, next) => {
    try {
        if (req.user.role !== ROLES.LEADER) {
            return next(new AppError("Only leaders can create posts", 403));
        }

        let mediaUrl = null;

        if (req.file) {
            const upload = await uploadToCloudinary(
                req.file.buffer,
                "posts",
                "auto"
            );
            mediaUrl = upload.secure_url;
        }

        const post = await Post.create({
            author: req.user.userId,
            title: req.body.title,
            text: req.body.text,
            mediaUrl,
            mediaType: req.body.mediaType,
        });

        const populated = await post.populate(
            "author",
            "name profilePhoto faith role"
        );

        // 🔔 Notify all followers
        const { notifyMany } = require("../utils/sendNotification.util");
        const authorUser = await User.findById(req.user.userId).select("followers");
        if (authorUser && authorUser.followers.length > 0) {
            notifyMany(authorUser.followers, {
                sender: req.user.userId,
                type: NOTIFICATION_TYPES.NEW_POST,
                title: "New Post from Leader",
                message: `${populated.author.name} shared a new post: ${post.title || "Check it out!"}`,
                data: { postId: post._id, type: "POST" }
            });
        }

        ResponseUtil.success(res, populated, "Post created", 201);
    } catch (err) {
        next(err);
    }
};


exports.getExplorePosts = async (req, res, next) => {
    try {
        const { limit = 20, offset = 0 } = req.query;

        const posts = await Post.find({})
            .sort({ createdAt: -1 })
            .skip(Number(offset))
            .limit(Number(limit))
            .populate("author", "name profilePhoto faith role");

        ResponseUtil.success(res, posts, "Explore posts");

    } catch (err) {
        next(err);
    }
};

exports.getFollowingPosts = async (req, res, next) => {
    try {
        const me = await User.findById(req.user.userId).select("following");
        if (!me) {
            return next(new AppError("User not found", HTTP_STATUS.NOT_FOUND));
        }

        const { limit = 20, offset = 0 } = req.query;

        const posts = await Post.find({ author: { $in: me.following } })
            .sort({ createdAt: -1 })
            .skip(Number(offset))
            .limit(Number(limit))
            .populate("author", "name profilePhoto faith role");

        ResponseUtil.success(res, posts, "Following posts");
    } catch (err) {
        next(err);
    }
};

exports.toggleLike = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const post = await Post.findById(id);
        if (!post) {
            return next(new AppError("Post not found", HTTP_STATUS.NOT_FOUND));
        }

        const alreadyLiked = post.likes.some(
            (u) => u.toString() === userId.toString()
        );

        if (alreadyLiked) {
            post.likes.pull(userId);
        } else {
            post.likes.addToSet(userId);
        }

        await post.save();

        // 🔔 Notify Author if it's a new like
        if (!alreadyLiked && post.author.toString() !== userId.toString()) {
            const liker = await User.findById(userId).select("name");
            sendNotification({
                recipient: post.author,
                sender: userId,
                type: NOTIFICATION_TYPES.LIKE,
                title: "Post Liked",
                message: `${liker?.name || "Someone"} liked your post!`,
                data: { postId: post._id }
            });
        }

        ResponseUtil.success(res, { liked: !alreadyLiked, likesCount: post.likes.length }, "Like toggled");
    } catch (err) {
        next(err);
    }
};

exports.toggleSave = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const post = await Post.findById(id);
        if (!post) {
            return next(new AppError("Post not found", HTTP_STATUS.NOT_FOUND));
        }

        const alreadySaved = post.saves.some(
            (u) => u.toString() === userId.toString()
        );

        if (alreadySaved) {
            post.saves.pull(userId);
        } else {
            post.saves.addToSet(userId);
        }

        await post.save();

        ResponseUtil.success(res, { saved: !alreadySaved, savesCount: post.saves.length }, "Save toggled");
    } catch (err) {
        next(err);
    }
};

exports.getMyPosts = async (req, res, next) => {
    try {
        const posts = await Post.find({ author: req.user.userId })
            .populate("author", "name profilePhoto faith role")
            .sort({ createdAt: -1 });
        ResponseUtil.success(res, posts);
    } catch (err) {
        next(err);
    }
};

exports.getUserPosts = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const posts = await Post.find({ author: userId })
            .populate("author", "name profilePhoto faith role")
            .sort({ createdAt: -1 });
        ResponseUtil.success(res, posts);
    } catch (err) {
        next(err);
    }
};

exports.getPostById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const post = await Post.findById(id)
            .populate("author", "name profilePhoto faith role");

        if (!post) {
            return next(new AppError("Post not found", HTTP_STATUS.NOT_FOUND));
        }

        ResponseUtil.success(res, post);
    } catch (err) {
        next(err);
    }
};


exports.createComment = async (req, res, next) => {
    try {
        const { postId, comment } = req.body;

        if (!postId || !comment) {
            return next(
                new AppError("Missing required fields", HTTP_STATUS.BAD_REQUEST)
            );
        }

        const post = await Post.findById(postId);
        if (!post) {
            return next(new AppError("Post not found", HTTP_STATUS.NOT_FOUND));
        }

        post.comments.push({
            comment,
            userId: req.user.userId,
        });

        await post.save();

        await post.populate("comments.userId", "name profilePhoto");

        ResponseUtil.success(
            res,
            post.comments,
            "Comment posted successfully",
            HTTP_STATUS.CREATED
        );
    } catch (err) {
        next(err);
    }
};

exports.getPostComments = async (req, res, next) => {
    try {
        const { postId } = req.params;

        if (!postId) {
            return next(
                new AppError("Post ID required", HTTP_STATUS.BAD_REQUEST)
            );
        }

        const post = await Post.findById(
            postId,
            { comments: 1, _id: 0 }
        ).populate("comments.userId", "name profilePhoto");

        if (!post || post.comments.length === 0) {
            return ResponseUtil.success(res, [], "No comments yet");
        }

        ResponseUtil.success(res, post.comments);
    } catch (err) {
        next(err);
    }
};



exports.deletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return next(new AppError("Post not found", HTTP_STATUS.NOT_FOUND));
        }

        if (post.author.toString() !== req.user.userId.toString()) {
            return next(
                new AppError("Not authorized", HTTP_STATUS.FORBIDDEN)
            );
        }

        await post.deleteOne();

        ResponseUtil.success(res, null, "Post deleted");
    } catch (err) {
        next(err);
    }
};


// controllers/post.controller.js
exports.getSavedPosts = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const posts = await Post.find({
            saves: userId,
        })
            .sort({ createdAt: -1 })
            .populate("author", "name profilePhoto faith role");

        ResponseUtil.success(res, posts, "Saved posts");
    } catch (err) {
        next(err);
    }
};

exports.getLikedPosts = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const posts = await Post.find({
            likes: userId,
        })
            .sort({ createdAt: -1 })
            .populate("author", "name profilePhoto faith role");

        ResponseUtil.success(res, posts, "Liked posts");
    } catch (err) {
        next(err);
    }
};
