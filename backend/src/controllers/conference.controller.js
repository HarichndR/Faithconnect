const Conference = require("../models/conference.model");
const ResponseUtil = require("../utils/response.util");
const AppError = require("../utils/AppError.util");
const { HTTP_STATUS } = require("../constants");
const { v4: uuidv4 } = require("uuid");

exports.createConference = async (req, res, next) => {
    try {
        const { title, description } = req.body;

        const conference = await Conference.create({
            title,
            description,
            leader: req.user.userId,
            roomId: uuidv4(),
            status: "planned"
        });

        ResponseUtil.success(res, conference, "Conference created successfully", 201);
    } catch (err) {
        next(err);
    }
};

exports.getConferences = async (req, res, next) => {
    try {
        const conferences = await Conference.find({
            status: { $in: ["planned", "live"] }
        })
            .populate("leader", "name profilePhoto faith")
            .sort({ status: -1, startTime: 1 });

        ResponseUtil.success(res, conferences, "Conferences fetched successfully");
    } catch (err) {
        next(err);
    }
};

exports.getConferenceByRoomId = async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const conference = await Conference.findOne({ roomId })
            .populate("leader", "name profilePhoto faith");

        if (!conference) {
            return next(new AppError("Conference not found", HTTP_STATUS.NOT_FOUND));
        }

        ResponseUtil.success(res, conference, "Conference details fetched");
    } catch (err) {
        next(err);
    }
};

exports.updateStatus = async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const { status } = req.body;

        const conference = await Conference.findOneAndUpdate(
            { roomId, leader: req.user.userId },
            { status },
            { new: true }
        );

        if (!conference) {
            return next(new AppError("Conference not found or unauthorized", HTTP_STATUS.NOT_FOUND));
        }

        ResponseUtil.success(res, conference, `Status updated to ${status}`);
    } catch (err) {
        next(err);
    }
};
