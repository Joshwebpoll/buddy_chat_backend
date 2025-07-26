const express = require("express");

const router = express.Router();
const {
  registerUser,
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
  getSingleUser,
  uploadPhoto,
} = require("../controllers/userAuthController");
const protectRoute = require("../middlewares/protectRoute");
const upload = require("../config/multer");

// router.route("/register").post(createProduct).get(getAllProducts);

router.post("/register", upload.single("image"), registerUser);
router.post("/login", loginUser);
router.post("/emailVerification", verifyUserEmail);
router.post("/logout", logOutUser);
router.post("/forgotPassword", resetUserPassword);
router.post("/resetpassword/:token", resetUserPasswordLink);
router.post("/resetpasswordmobile", resetUserPasswordOtpMobile);
router.post("/updatepasswordmobile", updatePasswordOtpMobile);
router.get("/checkauth", protectRoute, protectedRoute);
router.post("/resendCode", ResendVerificationEmailToUser);
router.post("/resendEmailCode", resendEmailVerificationCode);
router.get("/profile", protectRoute, fetchUsers);
router.get("/me", protectRoute, getSingleUser);
router.post("/upload", protectRoute, upload.single("image"), uploadPhoto);

module.exports = router;
