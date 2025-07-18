const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const axios = require("axios");
const http = require("http");
const { Server } = require("socket.io");
const app = express();

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const connectToDB = require("./db/connect");
const chatRoute = require("./route/chat_route");
const userAuthRoute = require("./route/userAuth.js");
const cookieParser = require("cookie-parser");
const chatSocket = require("./socket/chat_socket");
// ✅ Allow all origins (for development)
app.use(cors());
// Attach Socket.IO to app locals
app.locals.io = io;
// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// Simple route to respond to pings
app.get("/ping", (req, res) => {
  res.send("pong");
});
// Routes

app.use("/api/v1/auth", userAuthRoute);
app.use("/api/v1/chat", chatRoute);

// Socket.IO Connection Handler (for clients to listen)
// io.on("connection", (socket) => {});
chatSocket(io);
// Start Server
const port = process.env.PORT || 3000;
const startServer = async () => {
  try {
    await connectToDB();
    console.log("connected to db");

    httpServer.listen(port, "0.0.0.0", () => {
      console.log(`Server running with WebSocket at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

startServer();

// Cron Job: Only runs in production
if (process.env.NODE_ENV === "production") {
  cron.schedule("*/14 * * * *", async () => {
    const url = process.env.RENDER_URL || `http://localhost:${port}/ping`;

    try {
      console.log(`[Cron] Pinging ${url}...`);
      const response = await axios.get(url);
      console.log(`[Cron] Ping response: ${response.status}`);
    } catch (error) {
      console.error("[Cron] Ping failed:", error.message);
    }
  });
}
