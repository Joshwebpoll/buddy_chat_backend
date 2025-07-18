const mongoose = require("mongoose");
const username = encodeURIComponent("<Josh>");
const password = encodeURIComponent("cnfoyCHV72APHMRn");
const mongoURI =
  "mongodb+srv://chat_app:chat_app@cluster0.nagr8dg.mongodb.net/"; // Replace with your MongoDB URI
const connectToDB = () => {
  return mongoose.connect(mongoURI, {});
};

module.exports = connectToDB;
