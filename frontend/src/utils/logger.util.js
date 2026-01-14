import { LOG_LEVEL } from "../constants";
import { sendLogToBackend } from "../services/log.service";

// Frontend logger: still logs to console for dev UX,
// but backend logging is made best-effort and non-blocking
// so network issues won't surface as visible errors.
const logger = {
  info(message, meta = {}) {
    // Purely informational – safe to always show in console.
    console.log("[INFO]", message, meta);
    try {
      sendLogToBackend({ level: LOG_LEVEL.INFO, message, meta });
    } catch {
      // ignore logging failures completely
    }
  },

  warn(message, meta = {}) {
    // Use console.warn so it is visible but non-fatal.
    console.warn("[WARN]", message, meta);
    try {
      sendLogToBackend({ level: LOG_LEVEL.WARN, message, meta });
    } catch {
      // ignore
    }
  },

  error(message, meta = {}) {
    /**
     * IMPORTANT:
     * Using console.error in React Native dev causes a red box
     * overlay that looks like a crash. For API / recoverable errors
     * we only want to show inline UI messages, not crash the app.
     *
     * So in dev we downgrade to console.warn; in production builds,
     * console.error is fine because users won't see the red box.
     */
    if (__DEV__) {
      console.warn("[ERROR]", message, meta);
    } else {
      console.error("[ERROR]", message, meta);
    }

    try {
      sendLogToBackend({ level: LOG_LEVEL.ERROR, message, meta });
    } catch {
      // ignore
    }
  },
};

export default logger;
