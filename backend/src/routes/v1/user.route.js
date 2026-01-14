const router = require("express").Router();
const auth = require("../../middlewares/auth.middleware");
const controller = require("../../controllers/user.controller");

// Get current authenticated user profile
router.get("/me", auth, controller.getMe);
router.get("/chat-candidates", auth, controller.getChatCandidates);

// Update current authenticated user profile (onboarding-friendly)
const upload = require("../../middlewares/upload.middleware");
router.patch("/me", auth, upload.single("profilePhoto"), controller.updateMe);

// Register Expo/device push token for notifications
router.post("/me/device-token", auth, controller.registerDeviceToken);

// Get user by ID (supports "me" as well)
router.get("/:id", auth, controller.getUserById);

// Get user followers
router.get("/:id/followers", auth, controller.getUserFollowers);
// routes/leader.routes.js
router.post("/:id/follow", auth, controller.followLeader);
router.delete("/:id/follow", auth, controller.unfollowLeader);

module.exports = router;

