const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const cloudinary = require("../config/cloudinary");
const AppError = require("../utils/AppError.util");
const env = require("../config/env");
const { HTTP_STATUS, ROLES, FAITHS } = require("../constants");

exports.register = async (body, file) => {
    const { name, email, password, role, faith, bio } = body;

    if (!name || !email || !password || !role || !faith) {
        throw new AppError(
            "Missing required fields",
            HTTP_STATUS.BAD_REQUEST,
            "MISSING_FIELDS"
        );
    }

    if (!Object.values(ROLES).includes(role)) {
        throw new AppError(
            "Invalid role",
            HTTP_STATUS.BAD_REQUEST,
            "INVALID_ROLE"
        );
    }
    console.log("#####" + faith.toUpperCase(), FAITHS)

    if (!FAITHS[faith.toUpperCase()]) {
        throw new AppError(
            "Invalid faith",
            HTTP_STATUS.BAD_REQUEST,
            "INVALID_FAITH"
        );
    }

    const exists = await User.findOne({ email });
    if (exists) {
        throw new AppError(
            "User already exists",
            HTTP_STATUS.BAD_REQUEST,
            "USER_EXISTS"
        );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let profilePhoto = null;

    if (file) {
        const upload = await cloudinary.uploader.upload(
            `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
            { folder: "profiles" }
        );
        profilePhoto = upload.secure_url;
    }

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        faith,
        bio: bio || "",
        profilePhoto,
    });

    const token = jwt.sign(
        { userId: user._id, role: user.role },
        env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    const userDoc = await User.findById(user._id).select("name email role faith bio profilePhoto following followers");

    return {
        token,
        user: {
            _id: userDoc._id,
            name: userDoc.name,
            email: userDoc.email,
            role: userDoc.role,
            faith: userDoc.faith,
            bio: userDoc.bio,
            profilePhoto: userDoc.profilePhoto,
            following: userDoc.following || [],
            followers: userDoc.followers || [],
        },
    };
};

exports.login = async (body) => {
    const { email, password } = body;

    if (!email || !password) {
        throw new AppError(
            "Email and password are required",
            HTTP_STATUS.BAD_REQUEST,
            "MISSING_FIELDS"
        );
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        throw new AppError(
            "Invalid email or password",
            HTTP_STATUS.BAD_REQUEST,
            "INVALID_CREDENTIALS"
        );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new AppError(
            "Invalid email or password",
            HTTP_STATUS.BAD_REQUEST,
            "INVALID_CREDENTIALS"
        );
    }

    const token = jwt.sign(
        { userId: user._id, role: user.role },
        env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    const userDoc = await User.findById(user._id).select("name email role faith bio profilePhoto following followers");

    return {
        token,
        user: {
            _id: userDoc._id,
            name: userDoc.name,
            email: userDoc.email,
            role: userDoc.role,
            faith: userDoc.faith,
            bio: userDoc.bio,
            profilePhoto: userDoc.profilePhoto,
            following: userDoc.following || [],
            followers: userDoc.followers || [],
        },
    };
};

exports.updateProfile = async (userId, body, file) => {
    const update = {};

    if (body.name !== undefined) update.name = body.name;
    if (body.bio !== undefined) update.bio = body.bio;

    if (file) {
        const upload = await cloudinary.uploader.upload(
            `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
            { folder: "profiles" }
        );
        update.profilePhoto = upload.secure_url;
    }

    const user = await User.findByIdAndUpdate(userId, update, { new: true });

    if (!user) {
        throw new AppError(
            "User not found",
            HTTP_STATUS.NOT_FOUND,
            "USER_NOT_FOUND"
        );
    }

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        faith: user.faith,
        bio: user.bio,
        profilePhoto: user.profilePhoto,
    };
};

exports.getMe = async (userId) => {
    const user = await User.findById(userId).select("name email role faith bio profilePhoto following followers");
    if (!user) {
        throw new AppError("User not found", HTTP_STATUS.NOT_FOUND, "USER_NOT_FOUND");
    }
    return user;
};
