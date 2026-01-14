const router = require("express").Router();
const auth = require("../../middlewares/auth.middleware");
const controller = require("../../controllers/leader.controller");

// Discover leaders
router.get("/", auth, controller.listLeaders);

// Follow / unfollow leader (worshipers primarily, but guarded in UI)
router.post("/:id/follow", auth, controller.followLeader);
router.delete("/:id/follow", auth, controller.unfollowLeader);

module.exports = router;

