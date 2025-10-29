
//import bcrypt from "bcryptjs";
import send_email from "../../../lib/node-mailer/index.js";
import { insertNewDocument,findOne } from "../../../helpers/index.js";
import crypto from "crypto";

const magicLinkSend = async (req, res) => {

  
  try {
 

    const { email } = req;
  
    const user = await findOne("user", { email });

    // console.log(user, "user");

    // if (!user) {
    //   return res.status(400).send({ status: 400, message: "Invalid Email" });
    // }

//     const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
// console.log(otp, "otp");

 

    // hash the otp
    // const saltRounds = 10;

    // const hashedOTP = await bcrypt.hash(otp, saltRounds);
    // console.log(hashedOTP, "hashedOTP");
const users = {};
   const token = crypto.randomBytes(20).toString("hex");
  users[token] = { email, expires: Date.now() + 15 * 60 * 1000 }; // 15 min valid

  const link = `http://localhost:3000/login?token=${token}`;

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
console.log("finalres");

  // return res.json({
  //     //status: "Pending",
  //     message: "Verification otp email sent",
  //     data: {
  //       userEmail: email,
  //     },
  //   });

  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: "Enter current otp",
    });
  }
};

export default magicLinkSend;
