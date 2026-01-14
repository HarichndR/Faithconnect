const logger = require("../utils/logger.util");
const ResponseUtil = require("../utils/response.util");
const { HTTP_STATUS } = require("../constants");

module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || HTTP_STATUS.SERVER_ERROR;
  const code = err.code || "INTERNAL_ERROR";

  // Structured backend log – optimized for readability and search in logs.
  logger.error({
    level: "error",
    requestId: req.requestId,
    code,
    message: err.message,
    statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  ResponseUtil.error(
    res,
    err.message || "Internal Server Error",
    statusCode,
    err.errors || null,
    code
  );
};
