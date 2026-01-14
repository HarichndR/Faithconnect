const router = require("express").Router();
const auth = require("../../middlewares/auth.middleware");
const controller = require("../../controllers/conference.controller");

router.get("/", auth, controller.getConferences);
router.post("/", auth, controller.createConference);
router.get("/:roomId", auth, controller.getConferenceByRoomId);
router.patch("/:roomId/status", auth, controller.updateStatus);

module.exports = router;
