const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError.util");
const env = require("../config/env");
const { HTTP_STATUS } = require("../constants");

module.exports = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return next(
            new AppError("Authorization token missing", HTTP_STATUS.UNAUTHORIZED)
        );
    }

    const token = header.split(" ")[1];

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);

        req.user = {
            userId: decoded.userId,
            role: decoded.role,
        };

        next();
    } catch (err) {
        next(new AppError("Invalid or expired token", HTTP_STATUS.UNAUTHORIZED));
    }
};
