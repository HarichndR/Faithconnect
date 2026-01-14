const router = require("express").Router();
const upload = require("../../middlewares/upload.middleware");
const auth = require("../../middlewares/auth.middleware");
const controller = require("../../controllers/auth.controller");

router.post(
    "/register",
    upload.single("profilePhoto"),
    controller.register
);

router.post(
    "/login",
    controller.login
);

router.put(
    "/profile",
    auth,
    upload.single("profilePhoto"),
    controller.updateProfile
);

router.get("/me", auth, controller.getMe);

module.exports = router;
