const express = require("express");

const {
  getUserMessage,
  createMessage,
  getMessagePreviews,
} = require("../controllers/chat_message");
const protectRoute = require("../middlewares/protectRoute");
const router = express.Router();

router.get("/get-previous/:userId", protectRoute, getUserMessage);
router.post("/create", protectRoute, createMessage);
router.get("/preview", protectRoute, getMessagePreviews),
  (module.exports = router);
