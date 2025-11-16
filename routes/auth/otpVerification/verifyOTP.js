// // import  userOTP  from "../../../models/index.js";
// // import user from'../../../models/index.js';

// import bcrypt from "bcryptjs";
// import {
//   deleteManyDocument,
//   insertNewDocument,
//   updateDocument,
//   find,
//   findOne
// } from "../../../helpers/index.js";
// import Joi from "joi";
// import { JWT_EXPIRES_IN, JWT_EXPIRES_IN_REFRESH_TOKEN, REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET } from "../../../config/index.js";
// import jwt from "jsonwebtoken";

// const schema = Joi.object({
//   userEmail: Joi.string().email().required(),
//   otp: Joi.string().required()
// });


// const verifyOTP = async (req, res) => {

//   try {

//     await schema.validateAsync(req.body)
//     const { userEmail, otp } = req.body;
//       if (!userEmail || !otp) {
//         return res.status(400).send({ status: 400, message: "Both email and OTP are required" });
//       }
//      else {
//       const UserOTPVerificationRecords = await find("userOTP", {
//         userEmail,
//         status:"Pending"
//       });
//       console.log(UserOTPVerificationRecords,"UserOTPVerificationRecords----------");
      
//       if (!UserOTPVerificationRecords || UserOTPVerificationRecords.length == 0) {
//         // no record found
//         return res.status(400).send({ status: 400, message: "No OTP verification record found for this email. Please sign up again" });
      
//       } else {
//         // user otp record exists
//         const { expiresAt } = UserOTPVerificationRecords[0];
//         console.log(expiresAt,"expireat----------------");
        
//         const hashedOTP = UserOTPVerificationRecords[0].otp;

//         if (expiresAt < Date.now()) {
//           // user otp record has expired
//           //await UserOTPVerification.deleteMany({ userId });
//           const deleteOtp = await deleteManyDocument("userOTP", {
//             userEmail,
//             status:"Pending"
//           });
//           return res.status(400).send({ status: 400, message: "Code has expired. Please request again" });
      
//         } else {
//           const validOTP = await bcrypt.compare(otp, hashedOTP);
       
          
//           if (!validOTP) {
//             // supplied otp is wrong
//             return res.status(400).send({ status: 400, message: "The OTP you entered is invalid. Please check your inbox and try again." });
//           } else {
//             // success
         
            

//    const user = await findOne("user", {
   
//       email:userEmail,
    
   
//     });

//     // console.log(user, "user");
// let fcmTokens = await findOne("token", { 
//   user_id: user._id, 
//   fcmToken: { $exists: true, $ne: null }
// });


//   var token = jwt.sign({ id: user._id, role: user.userType }, ACCESS_TOKEN_SECRET, {
//              expiresIn: JWT_EXPIRES_IN,
//            });
//            var refresh_token = jwt.sign({ id: user._id, role: user.userType }, REFRESH_TOKEN_SECRET, {
//              expiresIn: JWT_EXPIRES_IN_REFRESH_TOKEN,
//            });
 
//   const inserttoken = await insertNewDocument("token", {
//          user_id: user._id,
//          accessToken: token,
//          refreshToken: refresh_token,
//          type: "refresh",
//        });
 
//              // Set Access Token in Cookie
//        res.cookie("token", token, {
//          httpOnly: true,
//          secure: process.env.NODE_ENV === "production" ? true : false, // sirf prod me https
//          sameSite: "none",
//          maxAge: 1000 * 60 * 60 * 24 // 1 day (ya JWT_EXPIRES_IN ke hisaab se)
//        });
 
//        // Set Refresh Token in Cookie (optional)
//        res.cookie("refreshToken", refresh_token, {
//          httpOnly: true,
//          secure: process.env.NODE_ENV === "production" ? true : false,
//          sameSite: "none",
//          maxAge: 1000 * 60 * 60 * 24 * 7 // 7 din
//        });

//           //  await updateDocument("user", { email: userEmail });
//             //  await UserOTPVerification.deleteMany({ userId });
              
//             await deleteManyDocument("userOTP", { userEmail });
    
//             res.status(200).json({
//               status: 200,
//               message: "OTP verified successfully.",
//               data:{
//                 user,
//                 token, refresh_token,fcmTokens
//               }
//             });
//           }
//         }
//       }
//     }
//   } catch (error) {
//     res.status(400).json({
//       status: 400,
//       message: error.message,
//     });
//   }
// };

// export default verifyOTP;


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

    console.log(UserOTPVerificationRecords, "UserOTPVerificationRecords----------");

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

    console.log(expiresAt, "expireat----------------");

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