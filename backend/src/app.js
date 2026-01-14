const express = require("express");
const headerMiddleware = require("./middlewares/header.middleware");
const requestLogger = require("./middlewares/requestLogger.middleware");
const errorHandler = require("./middlewares/errorHandler.middleware");
const cors = require("cors");
const healthRoutes = require("./routes/v1/health.route");
const authRoutes = require("./routes/v1/auth.route");
const logsRoutes = require("./routes/v1/logs.route");
const userRoutes = require("./routes/v1/user.route");
const postRoutes = require("./routes/v1/post.route");
const reelRoutes = require("./routes/v1/reel.route");
const leaderRoutes = require("./routes/v1/leader.route");
const chatRoutes = require("./routes/v1/chat.route");
const notificationRoutes = require("./routes/v1/notification.route");
const conferenceRoutes = require("./routes/v1/conference.route");

const app = express();

// Allow all origins in development for React Native
app.use(cors({
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"],
}));

app.options("*", cors());
app.use(express.json());

app.use(headerMiddleware);
app.use(requestLogger);

app.use("/api/v1", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", logsRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/reels", reelRoutes);
app.use("/api/v1/leaders", leaderRoutes);
app.use("/api/v1/chats", chatRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/conferences", conferenceRoutes);



app.use(errorHandler);

module.exports = app;
