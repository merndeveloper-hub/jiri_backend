// import  userOTP  from "../../../models/index.js";
// import user from'../../../models/index.js';

//import bcrypt from "bcryptjs";
import {
  deleteManyDocument,
  insertNewDocument,
  updateDocument,
  find,
  findOne
} from "../../../helpers/index.js";
import Joi from "joi";
import { JWT_EXPIRES_IN, JWT_EXPIRES_IN_REFRESH_TOKEN, REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET } from "../../../config/index.js";
import jwt from "jsonwebtoken";

const schema = Joi.object({
  userEmail: Joi.string().email().required(),
  otp: Joi.string().required()
});


const verifyMagicLink = async (req, res) => {

  try {

    await schema.validateAsync(req.body)
    const { userEmail, otp } = req.body;
      if (!userEmail || !otp) {
        return res.status(400).send({ status: 400, message: "Both email and OTP are required" });
      }
     else {
      const UserOTPVerificationRecords = await find("userOTP", {
        userEmail,
        status:"Pending"
      });
      console.log(UserOTPVerificationRecords,"UserOTPVerificationRecords----------");
      
      if (!UserOTPVerificationRecords || UserOTPVerificationRecords.length == 0) {
        // no record found
        return res.status(400).send({ status: 400, message: "No OTP verification record found for this email. Please sign up again" });
      
      } else {
        // user otp record exists
        const { expiresAt } = UserOTPVerificationRecords[0];
        console.log(expiresAt,"expireat----------------");
        
        const hashedOTP = UserOTPVerificationRecords[0].otp;

        if (expiresAt < Date.now()) {
          // user otp record has expired
          //await UserOTPVerification.deleteMany({ userId });
          const deleteOtp = await deleteManyDocument("userOTP", {
            userEmail,
            status:"Pending"
          });
          return res.status(400).send({ status: 400, message: "Code has expired. Please request again" });
      
        }
        
        else {
        //   const validOTP = await bcrypt.compare(otp, hashedOTP);
        //   console.log(validOTP,"validotp------------------");
          
        //   if (!validOTP) {
        //     // supplied otp is wrong
        //     return res.status(400).send({ status: 400, message: "The OTP you entered is invalid. Please check your inbox and try again." });
        //   } 
          
        //  else {
            // success
            console.log("1");
            

   const user = await findOne("user", {
   
      email:userEmail,
    
   
    });

    // console.log(user, "user");

  var token = jwt.sign({ id: user._id, role: user.userType }, ACCESS_TOKEN_SECRET, {
             expiresIn: JWT_EXPIRES_IN,
           });
           var refresh_token = jwt.sign({ id: user._id, role: user.userType }, REFRESH_TOKEN_SECRET, {
             expiresIn: JWT_EXPIRES_IN_REFRESH_TOKEN,
           });
 
  const inserttoken = await insertNewDocument("token", {
         user_id: user._id,
         accessToken: token,
         refreshToken: refresh_token,
         type: "refresh",
       });
 
             // Set Access Token in Cookie
       res.cookie("token", token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production" ? true : false, // sirf prod me https
         sameSite: "none",
         maxAge: 1000 * 60 * 60 * 24 // 1 day (ya JWT_EXPIRES_IN ke hisaab se)
       });
 
       // Set Refresh Token in Cookie (optional)
       res.cookie("refreshToken", refresh_token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production" ? true : false,
         sameSite: "none",
         maxAge: 1000 * 60 * 60 * 24 * 7 // 7 din
       });

          //  await updateDocument("user", { email: userEmail });
            //  await UserOTPVerification.deleteMany({ userId });
                console.log("2");
            await deleteManyDocument("userOTP", { userEmail });
          console.log("3");
            res.status(200).json({
              status: 200,
              message: "Magic Link verified successfully.",
              data:{
                user,
                token, refresh_token
              }
            });
          }
        }
      }
  //  }
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
};

export default verifyMagicLink;
