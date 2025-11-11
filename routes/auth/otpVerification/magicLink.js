
//import bcrypt from "bcryptjs";
import send_email from "../../../lib/node-mailer/index.js";
import { insertNewDocument,findOne } from "../../../helpers/index.js";
import crypto from "crypto";

const magicLinkSend = async (req, res) => {

  
  try {
 

    const { email } = req;
  
    const user = await findOne("user", { email });

 
const users = {};
   const token = crypto.randomBytes(20).toString("hex");
  users[token] = { email, expires: Date.now() + 15 * 60 * 1000 }; // 15 min valid

  const link = `http://localhost:5000/api/v1/auth/verifyMagicLink?otp=${token}&userEmail=${email}`;

    const otpRes = await insertNewDocument("userOTP", {
      userEmail: email,
     // userType:userType,
      otp: token,
      status:"Pending",
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });
  console.log(otpRes,"otpRes");
  
    await send_email(
      "otpTemplate",
      {
        otp: link,
       //user:user?.first_Name
      },
      "owaisy028@gmail.com",
      "Your lunibi Magic Link ",
      email
    );

  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: "Enter current otp",
    });
  }
};

export default magicLinkSend;
