const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
function generateJwtCookiesToken(res, userid) {
  const token = jwt.sign({ userid }, process.env.JWT_SECRET_KEY, {
    expiresIn: "5h",
  });

  //   res.cookie("username", "JohnDoe", {
  //     maxAge: 24 * 60 * 60 * 1000, // Cookie expires after 1 day
  //     httpOnly: true, // Makes the cookie accessible only by the web server
  //     secure: true, // Ensures the cookie is sent only over HTTPS
  //     sameSite: "strict", // Prevents the cookie from being sent with cross-site requests
  //   });

  // res.cookie("token", token, {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production",
  //   sameSite: "strict",
  //   maxAge: 7 * 24 * 60 * 60 * 1000,
  // });

  return token;
}
module.exports = generateJwtCookiesToken;
