import { logApi } from "./api.service";
import logger from "../utils/logger.util";

// Re-export logger
export { logger };

export const sendLogToBackend = (log) => {
  try {
    // DO NOT await — fire and forget
    logApi.post("/logs", log).catch((e) => {
      logger.warn("Log send failed (ignored)", e?.message);
    });
  } catch (e) {
    // Absolute safety net
    logger.warn("Unexpected logging error (ignored)", e?.message);
  }
};
