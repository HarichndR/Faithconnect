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
