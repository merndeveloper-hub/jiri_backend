

import bcrypt from "bcryptjs";
import {
  deleteManyDocument,
  insertNewDocument,
  updateDocument,
  find,
  findOne
} from "../../../helpers/index.js";
import Joi from "joi";
import { 
  JWT_EXPIRES_IN, 
  JWT_EXPIRES_IN_REFRESH_TOKEN, 
  REFRESH_TOKEN_SECRET, 
  ACCESS_TOKEN_SECRET 
} from "../../../config/index.js";
import jwt from "jsonwebtoken";

const schema = Joi.object({
  userEmail: Joi.string().email().required(),
  otp: Joi.string().required()
});

const verifyOTP = async (req, res) => {
  try {
    // Validate input
    await schema.validateAsync(req.body);
    const { userEmail, otp } = req.body;

    // Find pending OTP records
    const UserOTPVerificationRecords = await find("userOTP", {
      userEmail,
      status: "Pending"
    });

  

    // Check if OTP record exists
    if (!UserOTPVerificationRecords || UserOTPVerificationRecords.length === 0) {
      return res.status(400).send({ 
        status: 400, 
        message: "No OTP verification record found for this email. Please request a new OTP." 
      });
    }

    // Get first (latest) OTP record
    const otpRecord = UserOTPVerificationRecords[0];
    const { expiresAt, otp: hashedOTP } = otpRecord;


    // Check if OTP has expired
    if (expiresAt < Date.now()) {
      await deleteManyDocument("userOTP", {
        userEmail,
        status: "Pending"
      });
      return res.status(400).send({ 
        status: 400, 
        message: "Code has expired. Please request a new OTP." 
      });
    }

    // Verify OTP
    const validOTP = await bcrypt.compare(otp, hashedOTP);

    if (!validOTP) {
      return res.status(400).send({ 
        status: 400, 
        message: "The OTP you entered is invalid. Please check your inbox and try again." 
      });
    }

    // OTP is valid - proceed with user verification
    const user = await findOne("user", { email: userEmail });

    if (!user) {
      return res.status(404).send({
        status: 404,
        message: "User not found"
      });
    }

    // Get FCM tokens if exist
    let fcmTokens = await findOne("token", { 
      user_id: user._id, 
      fcmToken: { $exists: true, $ne: null }
    });

    // Generate JWT tokens
    const token = jwt.sign(
      { id: user._id, role: user.userType }, 
      ACCESS_TOKEN_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refresh_token = jwt.sign(
      { id: user._id, role: user.userType }, 
      REFRESH_TOKEN_SECRET, 
      { expiresIn: JWT_EXPIRES_IN_REFRESH_TOKEN }
    );

    // Save tokens to database
    await insertNewDocument("token", {
      user_id: user._id,
      accessToken: token,
      refreshToken: refresh_token,
      type: "refresh"
    });

    // Set cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    });

    res.cookie("refreshToken", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    });

    // Delete ALL OTP records for this email (not just pending)
    await deleteManyDocument("userOTP", { userEmail });

    // Send success response
    return res.status(200).json({
      status: 200,
      message: "OTP verified successfully.",
      data: {
        user,
        token,
        refresh_token,
        fcmTokens
      }
    });

  } catch (error) {
    console.error("OTP Verification Error:", error);
    return res.status(400).json({
      status: 400,
      message: error.message || "An error occurred during OTP verification"
    });
  }
};

export default verifyOTP;