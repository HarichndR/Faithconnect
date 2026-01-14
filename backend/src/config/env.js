const dotenv = require("dotenv");
dotenv.config();

module.exports = {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,

    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,

    CLOUDINARY: {
        CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
        API_KEY: process.env.CLOUDINARY_API_KEY,
        API_SECRET: process.env.CLOUDINARY_API_SECRET,
    },

    FIREBASE: {
        PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
        PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
    },
};
