import sendOTPSignup from "./sendOTPSignup.js";
//const  UserOTPVerification  = require("../../../models/otpVerification/index.js");
import { deleteManyDocument } from "../../../helpers/index.js";

const resendOTPVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .send({ status: 400, message: "Email is required" });
    } else {
      const deleteOtp = await deleteManyDocument("userOTP", {
        userEmail: email,
       // userType,
      });
      await sendOTPSignup({ email }, res);

      return res.status(200).json({
        status: 200,
        message: "Verification otp email sent",
        data: {
          userEmail: email,
        },
      });

      // return res
      //   .status(200)
      //   .json({ status: 200, message: sendOTPVerificationEmail });
    }
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message,
    });
  }
};

export default resendOTPVerificationCode;
