const router = require("express").Router();
const auth = require("../../middlewares/auth.middleware");
const upload = require("../../middlewares/upload.middleware");
const controller = require("../../controllers/reel.controller");

// Create reel (leaders only - enforced in controller)
router.post("/", auth, upload.single("reel"), controller.createReel);

// Feeds
router.get("/explore", auth, controller.getExploreReels);
router.get("/following", auth, controller.getFollowingReels);

// Specific lists
router.get("/my", auth, controller.getMyReels);
router.get("/saved", auth, controller.getSavedReels);
router.get("/liked", auth, controller.getLikedReels);
router.get("/user/:userId", auth, controller.getUserReels);

// Comments
router.post("/comment", auth, controller.createComment);
router.get("/:id/comments", auth, controller.getReelComments);

// Actions
router.post("/:id/like", auth, controller.toggleLike);
router.post("/:id/save", auth, controller.toggleSave);

module.exports = router;
