const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const Chat = require("../models/chat_message");
const mongoose = require("mongoose");
require("dotenv").config();
const getUserMessage = async (req, res) => {
  // console.log(req.user.userid, "hello", req.params.userId);
  try {
    const messages = await Chat.find({
      $or: [
        { sender: req.user.userid, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.userid },
      ],
    })
      // .populate("sender", "-password") // Populate sender details, exclude password
      // .populate("receiver", "-password")
      .sort({ createdAt: 1 });
    return res.status(StatusCodes.OK).json({
      messages: messages,
    });
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Something went wrong",
    });
  }
};
const createMessage = async (req, res) => {
  const { message, receiver } = req.body;
  const result = req.file;
  const io = req.app.locals.io;
  if (!message || !receiver) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "All field are required" });
  }

  try {
    const saveChat = new Chat({
      sender: req.user.userid,
      message: message,
      receiver: receiver,
      imageUrl: result.path,
      cloudinaryId: result.filename,
    });

    const messages = await saveChat.save();

    io.emit("chatMessage", messages);
    return res.status(StatusCodes.CREATED).json({ message: "message sent" });
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Something went wrong" });
  }

  //   try {
  //     const getPreviousMessage = Chat.find({});
  //     return res.status(StatusCodes.OK).json({
  //       message: getPreviousMessage,
  //     });
  //   } catch (error) {
  //     return res.status(StatusCodes.BAD_REQUEST).json({
  //       message: "Something went wrong",
  //     });
  //   }
};

// const handleChatMessage = async (io, data, socket) => {
//   // Socket.IO - Real-time chat

//   // Socket.IO Auth
//   io.use((socket, next) => {
//     const token = socket.handshake.auth.token;

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
//       socket.user = decoded.userid;

//       next();
//     } catch (err) {
//       next(new Error("Authentication error"));
//     }
//   });

//   try {
//     onlineUsers.set(socket.user, socket.id);
//     const saveChat = new Chat({
//       sender: socket.user,
//       receiver: data.to,
//       message: data.message,
//     });
//     const messages = await saveChat.save();
//     console.log(onlineUsers);
//     io.emit("chatMessage", messages);
//   } catch (error) {
//     console.log(error);
//     socket.emit("errorMessage", { error: "Failed to save" });
//   }
// };

const getMessagePreviews = async (req, res) => {
  const userId = req.user.userid;
  const userObjectId = new mongoose.Types.ObjectId(userId);

  try {
    const chats = await Chat.aggregate([
      {
        $match: {
          $or: [{ sender: userObjectId }, { receiver: userObjectId }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          chatPartner: {
            $cond: {
              if: { $eq: ["$sender", userObjectId] },
              then: "$receiver",
              else: "$sender",
            },
          },
        },
      },
      {
        $group: {
          _id: "$chatPartner",
          latestMessage: { $first: "$message" },
          createdAt: { $first: "$createdAt" },
          chatPartnerId: { $first: "$chatPartner" },
        },
      },

      // Lookup chat partner info
      {
        $lookup: {
          from: "users",
          localField: "chatPartnerId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      // Lookup count of unread messages sent from partner to current user
      {
        $lookup: {
          from: "chats",
          let: { partnerId: "$chatPartnerId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$sender", "$$partnerId"] },
                    { $eq: ["$receiver", userObjectId] },
                    { $eq: ["$isRead", false] },
                  ],
                },
              },
            },
            { $count: "count" },
          ],
          as: "unread",
        },
      },

      // Set unreadCount to 0 if not found
      {
        $addFields: {
          unreadCount: {
            $cond: [
              { $gt: [{ $size: "$unread" }, 0] },
              { $arrayElemAt: ["$unread.count", 0] },
              0,
            ],
          },
        },
      },

      {
        $project: {
          _id: 0,
          userId: "$user._id",
          name: "$user.name",
          imageUrl: "$user.imageUrl",
          latestMessage: 1,
          createdAt: 1,
          unreadCount: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return res.status(200).json(chats);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Something went wrong");
  }
};

module.exports = {
  createMessage,
  getMessagePreviews,
  getUserMessage,
};
