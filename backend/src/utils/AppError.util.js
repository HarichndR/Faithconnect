class AppError extends Error {
  /**
   * @param {string} message - Human readable message, safe to return to clients.
   * @param {number} statusCode - HTTP status code.
   * @param {string} [code] - Stable machine-readable error code, e.g. "INVALID_FAITH".
   * @param {object|null} [errors] - Optional field-level / validation details.
   */
  constructor(message, statusCode, code = "APP_ERROR", errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
