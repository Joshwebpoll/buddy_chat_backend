const { handleChatMessage } = require("../controllers/chat_message");
const jwt = require("jsonwebtoken");
const Chat = require("../models/chat_message");
const ChatThered = require("../models/chat_thread");
const User = require("../models/userModel");
require("dotenv").config();
const onlineUsers = new Map();
const chatSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      socket.user = decoded.userid;

      next();
    } catch (err) {
      console.log(err);
      next(new Error("Authentication error"));
    }
  });
  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.user} (socket: ${socket.id})`);
    onlineUsers.set(socket.user, socket.id);
    console.log("👥 Online Users:", onlineUsers);
    socket.on("chatMessage", async (data) => {
      console.log("i am checking", data);
      try {
        onlineUsers.set(socket.user, socket.id);
        const saveChat = new Chat({
          sender: socket.user,
          receiver: data.to,
          message: data.message,
        });
        const messages = await saveChat.save();
        // const chatThread = new ChatThered({
        //   sender: socket.user,
        //   receiver: data.to,
        //   lastMessage: data.message,
        //   UnreadMessage: false,
        // });
        const recieverId = onlineUsers.get(data.to);
        console.log(recieverId, "helloh");
        if (recieverId) {
          io.to(recieverId).emit("chatMessage", messages);
          console.log(messages);
        }
        //io.emit("chatMessage", messages);
        console.log(onlineUsers);
      } catch (error) {
        console.log(error);
        onlineUsers.delete(socket.user);
        socket.emit("errorMessage", { error: "Failed to save" });
      }
    });

    // 🔹 Handle mark as read
    socket.on("mark-read", async ({ from }) => {
      try {
        await Chat.updateMany(
          {
            sender: from,
            receiver: socket.user,
            isRead: false,
          },
          { $set: { isRead: true } }
        );
        io.to(from).emit("mark-read", {
          senderId: socket.user,
        });
        console.log("Messages marked as read");
      } catch (err) {
        console.error("Failed to mark messages as read:", err);
      }
    });

    socket.on("preview-message", async () => {});

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });
};

module.exports = chatSocket;
