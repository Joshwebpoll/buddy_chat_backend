const StatusCodes = require("http-status-codes");
const User = require("../models/userModel");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const {
  sendEmailToNewUsers,
  sendMailVerificationSuccess,
  sendForgotEmailLink,
  sendResetSuccessEmail,
} = require("../mailtrap/sendEmailsToUser");
const generateJwtCookiesToken = require("../libs/generateJwtTokenCookies");

// const uploadImage = async (req, res) => {
//   const result = req.file;
//   try {
//     const user = new User({
//       imageUrl: result.path,
//       cloudinaryId: result.filename,
//     });
//     await user.save();
//   } catch (error) {
//     console.log(error);
//   }
// };

const registerUser = async (req, res) => {
  const { email, name, password, platform } = req.body;
  const result = req.file;
  try {
    if (!email || !name || !password) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: false, message: "All field are required" });
    }
    if (platform === "web" && !result) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Image is required." });
    }
    if (password.length < 6) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: false, message: "Password Must be greater than 5" });
    }

    const userAlreadyExist = await User.findOne({ email });
    if (userAlreadyExist) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: false, message: "User already exist" });
    }

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    // const saltRounds = 10; // Defines the complexity, higher is more secure but slower
    // const hashedPassword = await bcryptjs.hash(password, saltRounds);

    const user = new User({
      email,
      password,
      name,
      verificationToken,
      imageUrl: result ? result.path : null,
      cloudinaryId: result ? result.filename : null,
      verificationTokenExpiresAt: Date.now() + 1 * 60 * 60 * 1000, // 1 hours
    });
    const userx = await user.save();

    const tokens = generateJwtCookiesToken(res, user._id);
    // sendEmailToNewUsers(email, name, verificationToken);

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "User created successfully",
      // verificationCode: userx.verificationToken,
      // user: {
      //   ...user._doc,
      //   password: undefined,
      //   token: tokens,
      // },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const ResendVerificationEmailToUser = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Field is required",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid Email Address please click the register button below",
      });
    }

    if (user.isverified) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Your Email as Already verified... Please Login",
      });
    }

    sendEmailToNewUsers(user.email, user.name, user.verificationToken);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Verification Code as been sent to your email address",
    });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: "Please all field are required" });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: "Invalid Email Address or Password" });
    }

    const compareHashPassword = await user.comparePassword(password);

    if (!compareHashPassword) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: "Invalid Email Address or Password" });
    }

    // if (!user.isverified) {
    //   return res.status(StatusCodes.BAD_REQUEST).json({
    //     success: false,
    //     message: "Email is not verified. Please verify your email first",
    //   });
    // }

    // if (user.status === "disabled") {
    //   return res.status(StatusCodes.BAD_REQUEST).json({
    //     success: false,
    //     message: "Your account is disabled. Please contact your administrator",
    //   });
    // }
    user.lastLogin = Date.now();
    await user.save();
    const tokens = generateJwtCookiesToken(res, user._id);
    const users = await User.findById(user._id).select("-password");

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Login Successful",
      email: users.email,
      name: users.name,

      token: tokens,
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.OK).json({
      success: false,
      message: error.message,
    });
  }
};

const resendEmailVerificationCode = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: false, message: "All field are required" });
    }
    const getCode = await User.findOne({ email: email });
    if (!getCode) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid Email Address",
      });
    }
    if (getCode.isverified === true) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Email already verified",
      });
    }
    sendEmailToNewUsers(getCode.email, getCode.name, getCode.verificationToken);
    return res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Verification code Sent to your Email" });
  } catch (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

const verifyUserEmail = async (req, res) => {
  const { verificationToken } = req.body;

  try {
    const checkEmailCode = await User.findOne({
      verificationToken,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!checkEmailCode) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid or expired verification code.",
      });
    }
    checkEmailCode.isverified = true;
    checkEmailCode.verificationToken = undefined;
    checkEmailCode.verificationTokenExpiresAt = undefined;
    await checkEmailCode.save();

    sendMailVerificationSuccess(checkEmailCode.email, checkEmailCode.name);

    return res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Email Verified Successful" });
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

const logOutUser = async (req, res) => {
  res.clearCookie("token");
  res
    .status(StatusCodes.OK)
    .json({ success: true, message: "Logged out successfully" });
};

const resetUserPassword = async (req, res) => {
  const { email, platform } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!platform) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "platform is required either for mobile or web",
      });
    }
    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid Email Address or Password",
      });
    }
    let tokenType;
    const mobilePasswordToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const generateResetToken = crypto.randomBytes(20).toString("hex");
    if (platform === "mobile") {
      tokenType = mobilePasswordToken;
    } else {
      tokenType = generateResetToken;
    }

    user.resetPasswordToken = tokenType;
    user.resetPasswordExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    await user.save();

    sendForgotEmailLink(
      user,
      platform === "mobile"
        ? tokenType
        : `${process.env.RESET_LINK}/forgotPassword/${generateResetToken}`,
      platform
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Email verification sent to your email",
    });
  } catch (error) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};
const resetUserPasswordLink = async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  if (password.length < 6) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ status: false, message: "Password Must be greater than 5" });
  }
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();
    sendResetSuccessEmail(user);
    res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Password reset was successful" });
  } catch (error) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

const resetUserPasswordOtpMobile = async (req, res) => {
  const { token } = req.body;
  // const { token } = req.params;

  if (token.length === 0 || !token) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      message: "In valid token... please try again later",
    });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    res
      .status(StatusCodes.OK)
      .json({ success: true, message: "valid otp token" });
  } catch (error) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

const updatePasswordOtpMobile = async (req, res) => {
  const { password, token } = req.body;
  // const { token } = req.params;
  if (password.length < 6) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ status: false, message: "Password Must be greater than 5" });
  }

  if (token.length === 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      message: "In valid token... please try again later",
    });
  }
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();
    sendResetSuccessEmail(user);
    return res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Password reset was successful" });
  } catch (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

const protectedRoute = async (req, res) => {
  try {
    const users = await User.findById(req.user.userid).select("-password");

    if (!users) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: true, message: "User not found" });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      name: users.name,
      email: users.email,
    });
  } catch (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

const fetchUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.userid } }).select(
      "name _id imageUrl"
    );

    if (!users) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: true, message: "User not found" });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      users,
    });
  } catch (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

const getSingleUser = async (req, res) => {
  const user = await User.findById(req.user.userid).select("-password");
  res.json(user);
};

const uploadPhoto = async (req, res) => {
  const userId = req.user.userid;
  const result = req.file;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          imageUrl: result.path,
          cloudinaryId: result.filename,
        },
      },
      { new: true }
    );

    return res
      .status(StatusCodes.OK)
      .json({ status: true, image: updatedUser.imageUrl });
  } catch (error) {
    return res
      .status(StatusCodes.BAD_GATEWAY)
      .json({ message: "Something went wrong" });
  }
};
module.exports = {
  registerUser,
  getSingleUser,
  loginUser,
  verifyUserEmail,
  logOutUser,
  resetUserPassword,
  resetUserPasswordLink,
  protectedRoute,
  ResendVerificationEmailToUser,
  resendEmailVerificationCode,
  resetUserPasswordOtpMobile,
  updatePasswordOtpMobile,
  fetchUsers,
  uploadPhoto,
};
