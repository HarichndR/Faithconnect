const mongoose = require("mongoose");
const logger = require("../utils/logger.util");
const env = require("./env");

module.exports = async () => {
    try {
        await mongoose.connect(env.MONGO_URI);
        logger.info("MongoDB connected");
    } catch (error) {
        logger.error("MongoDB connection failed", { error });
        process.exit(1);
    }
};
