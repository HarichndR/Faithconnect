const { STATUS } = require("../constants");

class ResponseUtil {
  static success(res, data = null, message = "OK", code = 200) {
    return res.status(code).json({
      status: STATUS.SUCCESS,
      message,
      data
    });
  }

  static error(res, message = "Error", code = 500, errors = null, errorCode = "ERROR") {
    return res.status(code).json({
      status: STATUS.ERROR,
      message,
      code: errorCode,
      errors
    });
  }
}

module.exports = ResponseUtil;
