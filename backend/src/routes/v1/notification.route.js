const router = require("express").Router();
const auth = require("../../middlewares/auth.middleware");
const controller = require("../../controllers/notification.controller");

router.get("/", auth, controller.listNotifications);
router.post("/read-all", auth, controller.markAllRead);
router.patch("/:id/read", auth, controller.markRead);

module.exports = router;

