const { handleChatMessage } = require("../controllers/chat_message");
const jwt = require("jsonwebtoken");
const Chat = require("../models/chat_message");

const User = require("../models/userModel");
require("dotenv").config();
const onlineUsers = new Map();
const chatSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    console.log(token);
    if (!token) {
      return next(new Error("Authentication token missing"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      socket.user = decoded.userid;

      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        console.error("JWT expired:", err.expiredAt);
        return next(new Error("Token expired. Please log in again."));
      }
      return next(new Error("Authentication error"));
    }
  });
  io.on("connection", (socket) => {
    // console.log(`✅ User connected: ${socket.user} (socket: ${socket.id})`);
    onlineUsers.set(socket.user, socket.id);
    console.log("👥 Online Users:", onlineUsers);
    socket.on("chatMessage", async (data) => {
      try {
        const saveChat = new Chat({
          sender: socket.user,
          receiver: data.to,
          message: data.message,
          imageUrl: data.imageUrl,
          name: data.name,
        });
        const messages = await saveChat.save();
        const recieverId = onlineUsers.get(data.to);
        //const sender = onlineUsers.get(socket.user);
        if (recieverId) {
          const senderUser = await User.findById(data.sender).select(
            "name imageUrl"
          );

          const fullMessage = {
            ...messages.toObject(),
            senderUser,
          };

          io.to(recieverId).emit("chatMessage", fullMessage);
        }
      } catch (error) {
        // console.log(error);
        onlineUsers.delete(socket.user);
        socket.emit("errorMessage", { error: "Failed to save" });
      }
    });

    // 🔹 Handle mark as read
    // socket.on("mark-read", async ({ from }) => {
    //   try {
    //     const data = await Chat.updateMany(
    //       {
    //         sender: from,
    //         receiver: socket.user,
    //         isRead: false,
    //       },
    //       { $set: { isRead: true } }
    //     );
    //     io.to(from).emit("mark-read", {
    //       senderId: socket.user,
    //     });
    //     console.log("Messages marked as read", data);
    //   } catch (err) {
    //     console.error("Failed to mark messages as read:", err);
    //   }
    // });
    socket.on("mark-read", async ({ from }) => {
      // console.log(from, "kkkkBosss");
      try {
        const filter = {
          sender: from,
          receiver: socket.user,
          isRead: false,
        };

        const before = await Chat.find(filter);
        // console.log("Before update:", before.length, "messages");

        const result = await Chat.updateMany(filter, {
          $set: { isRead: true },
        });
        //console.log("Updated count:", result.modifiedCount);

        const after = await Chat.find(filter);
        //console.log("After update:", after.length, "messages");

        io.to(from).emit("mark-read", {
          senderId: socket.user,
        });
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
