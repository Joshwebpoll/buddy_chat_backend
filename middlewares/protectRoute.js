const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { StatusCodes } = require("http-status-codes");
dotenv.config();
function protectRoute(req, res, next) {
  // const getToken = req.cookies.token;
  //or
  const getToken = req.headers["authorization"]?.split(" ")[1];

  try {
    const token = jwt.verify(getToken, process.env.JWT_SECRET_KEY);
    if (!token) {
      return res
        .status(StatusCodes.OK)
        .json({ success: false, message: "Invalid Token" });
    }

    req.user = token;
    next();
  } catch (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, message: "invalid token provided" });
  }
}

module.exports = protectRoute;
