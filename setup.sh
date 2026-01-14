#!/bin/bash

set -e  # exit on error

PROJECT_NAME="backend"
SRC_DIR="$PROJECT_NAME/src"

echo "🚀 Initializing Phase-1 backend structure..."

# ---------------------------
# Create directories
# ---------------------------
mkdir -p $SRC_DIR/{constants,config,middlewares,utils,sockets}
mkdir -p $SRC_DIR/routes/v1

# ---------------------------
# package.json
# ---------------------------
cat > $PROJECT_NAME/package.json <<EOF
{
  "name": "faithconnect-backend",
  "version": "1.0.0",
  "description": "FaithConnect Backend - Phase 1",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "winston": "^3.13.0",
    "uuid": "^9.0.1",
    "socket.io": "^4.7.5",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.3"
  }
}
EOF

# ---------------------------
# constants/index.js
# ---------------------------
cat > $SRC_DIR/constants/index.js <<EOF
module.exports = Object.freeze({
  STATUS: {
    SUCCESS: "success",
    ERROR: "error"
  },

  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500
  },

  ROLES: {
    WORSHIPER: "worshiper",
    LEADER: "leader"
  },

  HEADERS: {
    AUTH: "authorization",
    REQUEST_ID: "x-request-id",
    CLIENT: "x-client",
    APP_VERSION: "x-app-version"
  },

  LOG_SOURCE: {
    BACKEND: "backend",
    FRONTEND: "frontend"
  }
});
EOF

# ---------------------------
# utils/response.util.js
# ---------------------------
cat > $SRC_DIR/utils/response.util.js <<EOF
const { STATUS } = require("../constants");

class ResponseUtil {
  static success(res, data = null, message = "OK", code = 200) {
    return res.status(code).json({
      status: STATUS.SUCCESS,
      message,
      data
    });
  }

  static error(res, message = "Error", code = 500, errors = null) {
    return res.status(code).json({
      status: STATUS.ERROR,
      message,
      errors
    });
  }
}

module.exports = ResponseUtil;
EOF

# ---------------------------
# utils/AppError.util.js
# ---------------------------
cat > $SRC_DIR/utils/AppError.util.js <<EOF
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
EOF

# ---------------------------
# utils/logger.util.js
# ---------------------------
cat > $SRC_DIR/utils/logger.util.js <<EOF
const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

module.exports = logger;
EOF

# ---------------------------
# middlewares/header.middleware.js
# ---------------------------
cat > $SRC_DIR/middlewares/header.middleware.js <<EOF
const { v4: uuid } = require("uuid");
const { HEADERS } = require("../constants");

module.exports = (req, res, next) => {
  req.requestId = req.headers[HEADERS.REQUEST_ID] || uuid();
  req.client = req.headers[HEADERS.CLIENT] || "unknown";
  req.appVersion = req.headers[HEADERS.APP_VERSION] || "unknown";

  res.setHeader(HEADERS.REQUEST_ID, req.requestId);
  next();
};
EOF

# ---------------------------
# middlewares/requestLogger.middleware.js
# ---------------------------
cat > $SRC_DIR/middlewares/requestLogger.middleware.js <<EOF
const logger = require("../utils/logger.util");

module.exports = (req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    logger.info({
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startTime,
      source: "backend"
    });
  });

  next();
};
EOF

# ---------------------------
# middlewares/errorHandler.middleware.js
# ---------------------------
cat > $SRC_DIR/middlewares/errorHandler.middleware.js <<EOF
const logger = require("../utils/logger.util");
const ResponseUtil = require("../utils/response.util");
const { HTTP_STATUS } = require("../constants");

module.exports = (err, req, res, next) => {
  logger.error({
    requestId: req.requestId,
    message: err.message,
    stack: err.stack
  });

  ResponseUtil.error(
    res,
    err.message || "Internal Server Error",
    err.statusCode || HTTP_STATUS.SERVER_ERROR
  );
};
EOF

# ---------------------------
# routes/v1/health.route.js
# ---------------------------
cat > $SRC_DIR/routes/v1/health.route.js <<EOF
const router = require("express").Router();
const ResponseUtil = require("../../utils/response.util");

router.get("/health", (req, res) => {
  ResponseUtil.success(res, {
    status: "UP",
    timestamp: new Date()
  }, "Service is healthy");
});

module.exports = router;
EOF

# ---------------------------
# sockets/index.js
# ---------------------------
cat > $SRC_DIR/sockets/index.js <<EOF
const { Server } = require("socket.io");

module.exports = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" }
  });

  io.on("connection", (socket) => {
    socket.on("join", (userId) => {
      socket.userId = userId;
    });
  });

  global.io = io;
};
EOF

# ---------------------------
# app.js
# ---------------------------
cat > $SRC_DIR/app.js <<EOF
const express = require("express");
const headerMiddleware = require("./middlewares/header.middleware");
const requestLogger = require("./middlewares/requestLogger.middleware");
const errorHandler = require("./middlewares/errorHandler.middleware");

const healthRoutes = require("./routes/v1/health.route");

const app = express();

app.use(express.json());
app.use(headerMiddleware);
app.use(requestLogger);

app.use("/api/v1", healthRoutes);

app.use(errorHandler);

module.exports = app;
EOF

# ---------------------------
# server.js
# ---------------------------
cat > $SRC_DIR/server.js <<EOF
require("dotenv").config();
const http = require("http");
const app = require("./app");
const socketInit = require("./sockets");

const server = http.createServer(app);
socketInit(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
});
EOF

# ---------------------------
# .env
# ---------------------------
cat > $PROJECT_NAME/.env <<EOF
PORT=5000
NODE_ENV=development
EOF

echo "📦 Installing dependencies..."
cd $PROJECT_NAME
npm install

echo "✅ Phase-1 backend setup complete!"
echo "👉 Run: cd backend && npm run dev"
