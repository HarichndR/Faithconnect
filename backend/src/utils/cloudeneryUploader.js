const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (buffer, folder = "uploads", resource_type = "auto") => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: resource_type,
                chunk_size: 6 * 1024 * 1024, // 6MB chunks for large files
                eager_async: true,
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        stream.end(buffer);
    });
};

module.exports = uploadToCloudinary;