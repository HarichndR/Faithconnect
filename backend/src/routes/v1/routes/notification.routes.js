const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/notification.controller");

router.get("/", auth, controller.getMyNotifications);
router.patch("/:id/read", auth, controller.markAsRead);
router.patch("/read-all", auth, controller.markAllAsRead);
router.delete("/:id", auth, controller.deleteNotification);

module.exports = router;
