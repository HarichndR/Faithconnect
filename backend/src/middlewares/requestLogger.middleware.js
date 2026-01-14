const logger = require("../utils/logger.util");

module.exports = (req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    logger.info({
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startTime,
      source: "backend"
    });
  });

  next();
};
