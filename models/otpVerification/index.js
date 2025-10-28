import mongoose from "mongoose";
import userOTPVerification from "./userOTPVerification.js";

const userOTP = mongoose.model("userOTP", userOTPVerification);

export default userOTP ;