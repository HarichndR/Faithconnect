import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ENV from "../config/env";
import logger from "../utils/logger.util";

/* =====================================================
   BASE INSTANCES
===================================================== */
const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 15000,
});

const logApi = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 15000,
});

const uploadApi = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 180000, // 3 min for video
});

/* =====================================================
   REQUEST INTERCEPTORS (TOKEN)
===================================================== */
const attachToken = async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(attachToken);
logApi.interceptors.request.use(attachToken);
uploadApi.interceptors.request.use(attachToken);

/* ❌ DO NOT set multipart content-type manually */
// Axios will handle boundary correctly

/* =====================================================
   RESPONSE INTERCEPTOR (SAFE)
===================================================== */
api.interceptors.response.use(
  (response) => {
    const wrapper = response?.data;

    // Only transform POSTS (not reels, comments, auth)
    if (wrapper?.data) {
      if (Array.isArray(wrapper.data)) {
        wrapper.data = wrapper.data.map(transformPostIfNeeded);
      } else {
        wrapper.data = transformPostIfNeeded(wrapper.data);
      }
    }

    return response;
  },
  (error) => {
    logger.error("API Error", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });

    return Promise.reject(error);
  }
);

/* =====================================================
   TRANSFORM ONLY POSTS (NOT REELS)
===================================================== */
const transformPostIfNeeded = (data) => {
  if (!data || typeof data !== "object") return data;

  // Detect reels (do nothing)
  if (data.videoUrl) return data;

  // Detect posts
  return {
    ...data,
    caption: data.text ?? data.caption,
    image: data.mediaUrl ?? data.image,
  };
};

export { api, logApi, uploadApi };
export default api;
