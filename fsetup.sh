#!/bin/bash

set -e

PROJECT_NAME="frontend"
SRC_DIR="$PROJECT_NAME/src"

echo "🚀 Initializing Phase-1 frontend (React Native + Expo)..."

# ---------------------------
# Create Expo app
# ---------------------------
npx create-expo-app $PROJECT_NAME --template blank

# ---------------------------
# Create directories
# ---------------------------
mkdir -p $SRC_DIR/{config,constants,services,utils,navigation,screens}

# ---------------------------
# Install dependencies
# ---------------------------
cd $PROJECT_NAME
npm install axios socket.io-client
npm install @react-navigation/native
npm install @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context

# ---------------------------
# constants/index.js
# ---------------------------
cat > src/constants/index.js <<EOF
export const ROLES = {
  WORSHIPER: "worshiper",
  LEADER: "leader",
};

export const LOG_LEVEL = {
  INFO: "info",
  ERROR: "error",
  WARN: "warn",
};

export const API = {
  VERSION: "v1",
};

export const SOCKET_EVENTS = {
  RECEIVE_EVENT: "receive_event",
};
EOF

# ---------------------------
# config/env.js
# ---------------------------
cat > src/config/env.js <<EOF
export default {
  API_BASE_URL: "http://YOUR_BACKEND_URL/api/v1",
  SOCKET_URL: "http://YOUR_BACKEND_URL",
};
EOF

# ---------------------------
# services/api.service.js
# ---------------------------
cat > src/services/api.service.js <<EOF
import axios from "axios";
import ENV from "../config/env";
import logger from "../utils/logger.util";

const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  logger.info("API Request", {
    method: config.method,
    url: config.url,
  });
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    logger.error("API Error", {
      message: error.message,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

export default api;
EOF

# ---------------------------
# services/socket.service.js
# ---------------------------
cat > src/services/socket.service.js <<EOF
import { io } from "socket.io-client";
import ENV from "../config/env";
import logger from "../utils/logger.util";

let socket;

export const initSocket = (userId) => {
  socket = io(ENV.SOCKET_URL, {
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    logger.info("Socket connected");
    socket.emit("join", userId);
  });

  socket.on("disconnect", () => {
    logger.warn("Socket disconnected");
  });

  return socket;
};

export const getSocket = () => socket;
EOF

# ---------------------------
# services/log.service.js (Frontend → Backend logs)
# ---------------------------
cat > src/services/log.service.js <<EOF
import api from "./api.service";

export const sendLogToBackend = async (log) => {
  try {
    await api.post("/logs", log);
  } catch (e) {
    // Fail silently – logs should never crash app
  }
};
EOF

# ---------------------------
# utils/logger.util.js
# ---------------------------
cat > src/utils/logger.util.js <<EOF
import { LOG_LEVEL } from "../constants";
import { sendLogToBackend } from "../services/log.service";

const logger = {
  info(message, meta = {}) {
    console.log("[INFO]", message, meta);
    sendLogToBackend({ level: LOG_LEVEL.INFO, message, meta });
  },

  warn(message, meta = {}) {
    console.warn("[WARN]", message, meta);
    sendLogToBackend({ level: LOG_LEVEL.WARN, message, meta });
  },

  error(message, meta = {}) {
    console.error("[ERROR]", message, meta);
    sendLogToBackend({ level: LOG_LEVEL.ERROR, message, meta });
  },
};

export default logger;
EOF

# ---------------------------
# navigation/RootNavigator.js
# ---------------------------
cat > src/navigation/RootNavigator.js <<EOF
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HealthCheck from "../screens/HealthCheck";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Health"
        component={HealthCheck}
        options={{ title: "FaithConnect" }}
      />
    </Stack.Navigator>
  );
}
EOF

# ---------------------------
# screens/HealthCheck.js
# ---------------------------
cat > src/screens/HealthCheck.js <<EOF
import { View, Text } from "react-native";
import api from "../services/api.service";
import { useEffect, useState } from "react";

export default function HealthCheck() {
  const [status, setStatus] = useState("Checking...");

  useEffect(() => {
    api.get("/health")
      .then(() => setStatus("Backend Connected"))
      .catch(() => setStatus("Backend Not Reachable"));
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>{status}</Text>
    </View>
  );
}
EOF

# ---------------------------
# App.js
# ---------------------------
cat > App.js <<EOF
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
EOF

# ---------------------------
# .env (placeholder)
# ---------------------------
cat > .env <<EOF
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
EOF

echo "✅ Phase-1 frontend setup complete!"
echo "👉 Update backend URL in src/config/env.js"
echo "👉 Run: cd frontend && npx expo start"
