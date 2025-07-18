const { sender, client } = require("./mailTrapConfig");
const {
  VerifyEmailTemplate,
  resetPasswordUserLink,
  sendSuccessEmailToUser,
  sendResetEmailToUser,
} = require("./sendEmailTemplate");

function sendEmailToNewUsers(userEmail, name, verifyToken) {
  const recipients = [
    {
      email: userEmail,
    },
  ];

  try {
    client.send({
      from: sender,
      to: recipients,
      subject: "Welcome Email",
      html: VerifyEmailTemplate(name, verifyToken),
      category: "Integration Test",
    });
  } catch (error) {
    // console.log(error);
  }
}

function sendMailVerificationSuccess(userEmail, username) {
  const recipients = [
    {
      email: userEmail,
    },
  ];

  try {
    client.send({
      from: sender,
      to: recipients,
      subject: "Email verified Successfull",
      html: sendSuccessEmailToUser(username),
      category: "Verification Success",
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.log(error);
  }
}

function sendForgotEmailLink(user, resentLink, platform) {
  const recipients = [
    {
      email: user.email,
    },
  ];

  try {
    client.send({
      from: sender,
      to: recipients,
      subject: "Email verified Successfull",
      html: resetPasswordUserLink(user, resentLink, platform),
      category: "Reset Password",
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.log(error);
  }
}
function sendResetSuccessEmail(user) {
  const recipients = [
    {
      email: user.email,
    },
  ];

  try {
    client.send({
      from: sender,
      to: recipients,
      subject: "Email verified Successfull",
      html: sendResetEmailToUser(user),
      category: "Resent Password",
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.log(error);
  }
}
module.exports = {
  sendEmailToNewUsers,
  sendMailVerificationSuccess,
  sendForgotEmailLink,
  sendResetSuccessEmail,
};
