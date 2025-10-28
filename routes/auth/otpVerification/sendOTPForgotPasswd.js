import userOTP from "../../../models/index.js";
import bcrypt from "bcryptjs";
import send_email from "../../../lib/node-mailer/index.js";
import { insertNewDocument, findOneAndSelect, findOne } from "../../../helpers/index.js";
import mongoose from "mongoose";
import Joi from "joi";



const schema = Joi.object({
  email: Joi.string().email().required(),
  userType: Joi.string()
});

const sendOTPForgotPasswd = async (req, res) => {

  
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await schema.validateAsync(req.body)

    const { email,userType } = req.body;
  
    const user = await findOne("user", { email});

    console.log(user, "user");

    if (!user || user.length == 0) {
      return res.status(401).send({ status: 401, message: "No account found with this email address" });
    }

    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    console.log(otp, "otp--------------------");

 

    // hash the otp
    const saltRounds = 10;

    const hashedOTP = await bcrypt.hash(otp, saltRounds);
    console.log(hashedOTP, "hashedOTP");

    const otpRes = await insertNewDocument("userOTP", {
      userEmail: email,
      userType:user.userType,
      status:"Pending",
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });
  console.log(otpRes,"otpRes");
  
    await send_email(
      "signuptemplate",
      {
        otp: otp,
      },
      "owaisy028@gmail.com",
      "Verify Your Email",
      email
    );
console.log("finalres");

await session.commitTransaction();
    session.endSession();

  return res.status(200).json({
      status: 200,
      message: "Verification otp email sent",
      data: {
        userEmail: email,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: "Enter current otp",
    });
  }
};

export default sendOTPForgotPasswd;
