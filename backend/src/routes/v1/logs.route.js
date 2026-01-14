const router = require("express").Router();
const controller = require("../../controllers/logs.controller");

router.post("/logs", controller.createLog);

module.exports = router;
