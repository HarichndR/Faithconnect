import { Platform } from "react-native";

/**
 * For development with physical Android/iOS devices:
 * Set EXPO_PUBLIC_LOCAL_IP in .env to your Mac's local IP (e.g., 192.168.1.6)
 * 
 * Get your Mac's IP with: ifconfig | grep "inet 192"
 * 
 * Make sure:
 * 1. Android phone and Mac are on the same WiFi network
 * 2. Mac allows inbound connections on port 5050 (check firewall)
 * 3. Backend is running: npx nodemon src/server.js
 */

// Default to a common local IP - change to your machine's IP when testing on device
const LOCAL_IP = process.env.EXPO_PUBLIC_LOCAL_IP || "192.168.1.2";

// Warn if using default IP
if (__DEV__ && !process.env.EXPO_PUBLIC_LOCAL_IP) {
  console.warn(
    `[CONFIG] Using default LOCAL_IP ${LOCAL_IP}. If this is wrong, set EXPO_PUBLIC_LOCAL_IP in .env`
  );
}

export default {
  // Always use the local network IP for physical devices
  // Expo Go on physical Android/iOS devices can't use localhost (that's the device itself)
  API_BASE_URL: `http://${LOCAL_IP}:5050/api/v1`,
  SOCKET_URL: `http://${LOCAL_IP}:5050`,
};
