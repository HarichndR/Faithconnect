const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const socketInit = require("./sockets");
const env = require("./config/env");


(async () => {
  await connectDB();

  const server = http.createServer(app);
  socketInit(server);

  server.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT}`);
  });
})();
