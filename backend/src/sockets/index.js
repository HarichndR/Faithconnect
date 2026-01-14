const { Server } = require("socket.io");

module.exports = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" }
  });

  io.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on("join", (userId) => {
      socket.userId = userId;
      logger.info(`User ${userId} joined with socket ${socket.id}`);
    });

    // ---------------- WebRTC Signaling ----------------

    // Joint a specific conference room
    socket.on("join-conference", (roomId) => {
      socket.join(roomId);
      logger.info(`Socket ${socket.id} joined conference room: ${roomId}`);

      // Notify the leader (streamer) that a new viewer joined
      socket.to(roomId).emit("viewer-joined", { socketId: socket.id, userId: socket.userId });
    });

    // Leave a conference room
    socket.on("leave-conference", (roomId) => {
      socket.leave(roomId);
      logger.info(`Socket ${socket.id} left conference room: ${roomId}`);
    });

    // Relay signaling messages (offer, answer, ice-candidate)
    socket.on("signal", ({ to, from, signal }) => {
      logger.info(`Relaying signal from ${from} to ${to} (type: ${signal.type || 'ice-candidate'})`);
      io.to(to).emit("signal", { from, signal });
    });

    // Handle broadcaster ending the stream
    socket.on("end-stream", (roomId) => {
      logger.info(`Stream ended in room: ${roomId}`);
      socket.to(roomId).emit("stream-ended");
    });

    socket.on("disconnect", () => {
      logger.warn(`Socket disconnected: ${socket.id}`);
    });
  });

  global.io = io;
};

// Simple logger mock if not available, since winston might not be in the exact scope here 
// but it's usually globally available or required at top level of project.
const logger = {
  info: (m) => console.log(`[SOCKET INFO] ${m}`),
  warn: (m) => console.warn(`[SOCKET WARN] ${m}`),
  error: (m) => console.error(`[SOCKET ERROR] ${m}`)
};
