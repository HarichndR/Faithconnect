const router = require("express").Router();
const auth = require("../../middlewares/auth.middleware");

const controller = require("../../controllers/chat.controller");

router.get("/", auth, controller.getChats);
router.get("/:chatId/messages", auth, controller.getMessages);
router.post("/message", auth, controller.sendMessage);
router.post("/read/:chatId", auth, controller.markAsRead);
router.post("/start", auth, controller.getOrCreateChat);

module.exports = router;
