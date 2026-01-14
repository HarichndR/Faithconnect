const ResponseUtil = require("../utils/response.util");

exports.createLog = async (req, res) => {
    try {
        const { level, message, meta } = req.body;

        // Just log to console, don't use logger to avoid circular logging
        if (level === "error") {
            console.error("[FRONTEND ERROR]", message, meta);
        } else if (level === "warn") {
            console.warn("[FRONTEND WARN]", message, meta);
        } else {
            console.log("[FRONTEND INFO]", message, meta);
        }

        ResponseUtil.success(res, null, "Log recorded");
    } catch (err) {
        console.error("Failed to record log", err.message);
        ResponseUtil.error(res, "Failed to record log", 500);
    }
};
