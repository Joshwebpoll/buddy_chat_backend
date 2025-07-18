const { default: mongoose } = require("mongoose");
const moongoose = require("moongoose");

const chatThreadSchema = new mongoose.Schema(
  {
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastMessage: { type: String },
    UnreadMessage: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ChatThered = mongoose.model("ChatThered", chatThreadSchema);
module.exports = ChatThered;
