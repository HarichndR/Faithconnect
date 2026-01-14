const { v4: uuid } = require("uuid");
const { HEADERS } = require("../constants");

module.exports = (req, res, next) => {
  req.requestId = req.headers[HEADERS.REQUEST_ID] || uuid();
  req.client = req.headers[HEADERS.CLIENT] || "unknown";
  req.appVersion = req.headers[HEADERS.APP_VERSION] || "unknown";

  res.setHeader(HEADERS.REQUEST_ID, req.requestId);
  next();
};
