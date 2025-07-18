const { MailtrapClient } = require("mailtrap");
const dotenv = require("dotenv");
dotenv.config();

const client = new MailtrapClient({
  token: process.env.MAILTRAP_TOKEN,
});

const sender = {
  email: "hello@irenecopywriters.com",
  name: "Joshdatabiz",
};
// const recipients = [
//   {
//     email: "joshuaharyoxxi@gmail.com",
//   },
// ];

// client
//   .send({
//     from: sender,
//     to: recipients,
//     subject: "You are awesome!",
//     text: "Congrats for sending test email with Mailtrap!",
//     category: "Integration Test",
//   })
//   .then(console.log, console.error);
module.exports = { sender, client };
