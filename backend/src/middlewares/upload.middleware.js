const multer = require("multer");

const storage = multer.memoryStorage(); // 🔥 REQUIRED for Cloudinary

const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB (videos)
    },
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype.startsWith("image/") ||
            file.mimetype.startsWith("video/")
        ) {
            cb(null, true);
        } else {
            cb(new Error("Only image/video files allowed"), false);
        }
    },
});

module.exports = upload;
