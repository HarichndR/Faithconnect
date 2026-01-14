const router = require("express").Router();
const ResponseUtil = require("../../utils/response.util");

router.get("/health", (req, res) => {
  ResponseUtil.success(res, {
    status: "UP",
    timestamp: new Date()
  }, "Service is healthy");
});

module.exports = router;
