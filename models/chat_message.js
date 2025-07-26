const { default: mongoose } = require("mongoose");
const moongoose = require("moongoose");

const chatSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: {
      type: String,
      default: null,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      default: null,
    },
    cloudinaryId: {
      type: String,
      default: null,
    },

    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
