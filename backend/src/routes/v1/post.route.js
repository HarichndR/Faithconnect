const router = require("express").Router();
const auth = require("../../middlewares/auth.middleware");
const upload = require("../../middlewares/upload.middleware");
const controller = require("../../controllers/post.controller");

// Create post (leaders only - enforced in controller)
router.post("/", auth, upload.single("media"), controller.createPost);

// Specific lists
router.get("/my", auth, controller.getMyPosts);
router.get("/saved", auth, controller.getSavedPosts);
router.get("/liked", auth, controller.getLikedPosts);
router.get("/user/:userId", auth, controller.getUserPosts);

// Feeds
router.get("/explore", auth, controller.getExplorePosts);
router.get("/following", auth, controller.getFollowingPosts);

// Single items
router.get("/:id", auth, controller.getPostById);

// Actions
router.post("/:id/like", auth, controller.toggleLike);
router.post("/:id/save", auth, controller.toggleSave);
router.put("/comment", auth, controller.createComment);
router.get("/comments/:postId", auth, controller.getPostComments);
router.delete("/:id", auth, controller.deletePost);

module.exports = router;
