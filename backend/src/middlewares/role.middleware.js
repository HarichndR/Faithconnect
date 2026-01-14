const AppError = require("../utils/AppError.util");
const { HTTP_STATUS, ROLES } = require("../constants");

/**
 * Ensure the authenticated user has one of the allowed roles.
 * Must be used after the auth middleware so req.user is populated.
 *
 * @param {Array<string>} allowedRoles
 */
const requireRole = (allowedRoles = []) => (req, res, next) => {
    if (!req.user || !req.user.role) {
        return next(
            new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED)
        );
    }

    if (!allowedRoles.includes(req.user.role)) {
        return next(
            new AppError("Forbidden", HTTP_STATUS.FORBIDDEN)
        );
    }

    return next();
};

module.exports = {
    requireRole,
    ROLES,
};

