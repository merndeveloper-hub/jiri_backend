import express from "express";
//import tokenVerification from "../../middleware/token-verification/index.js";
//import adminLogin from "./admin-auth/login.js";
//import adminSignup from "./admin-auth/signup.js";
import loginUser from "./login/index.js";
// import forgotPaasswd from "./forgotPasswd/index.js";
import resendOTPVerificationCode from "./otpVerification/resendOTPVerificationCode.js";
import verifyOTP from "./otpVerification/verifyOTP.js";
import sendOTPForgotPasswd from "./otpVerification/sendOTPForgotPasswd.js";

// const addWalletAddress = require("./signup/add-wallet-address");
import userSignup from "./signup/userSignup.js";
import verifyMagicLink from "./otpVerification/verifyMagicLink.js";
// import proSignup from "./signup/proSignup.js";
// import logout from "./logout/index.js";
const router = express.Router();

//----------User and Pro Forgot Password--------------------//
//router.post("/forgetpassword", tokenVerification, forgotPaasswd);

//----------User and Pro Verify OTP --------------------//
router.post("/verifyotp",  verifyOTP);

//----------User and Pro Verify OTP --------------------//
router.post("/verifyMagicLink",  verifyMagicLink);

//----------User and Pro forgot Password Send OTP--------------------//
router.post("/sendotp",  sendOTPForgotPasswd);

//----------User and Pro ReSend OTP--------------------//
router.post("/resendotp",  resendOTPVerificationCode);

//----------User Register--------------------//
router.post("/register/user", userSignup);

//----------Pro Register--------------------//
//router.post("/register/pro", proSignup);

//----------User and Pro Login --------------------//
router.post("/userlogin", loginUser);

//----------User and Pro Logout --------------------//
//router.delete("/logout/:id",  logout);

// router.get("/register/metamask/:username", tokenVerification, addWalletAddress);

// Admin
// router.post("/admin/register", adminSignup);
// router.post("/login", adminLogin);

export default router;
