import Joi from "joi";
import {
  findOne,
  insertNewDocument,
  findOneAndSelect,
  getAggregate,
  deleteDocument,
} from "../../../helpers/index.js";
import { JWT_EXPIRES_IN, JWT_EXPIRES_IN_REFRESH_TOKEN, REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET } from "../../../config/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
//import mongoose from "mongoose";
import sendOTPSignup from "../otpVerification/sendOTPSignup.js";

import magicLinkSend from "../otpVerification/magicLink.js";

const schema = Joi.object({
  // first_Name: Joi.string().min(3).required(),
  // last_Name: Joi.string().min(3).required(),
  email: Joi.string()
    .email({ tlds: { allow: true } }) // Ensures a valid domain with TLD (e.g., .com, .org)
    .pattern(new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) // Enforces common email rules
    .required()
    .messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
      "string.pattern.base": "Invalid email structure",
    }),
  magicLink: Joi.boolean(),
  isMedia: Joi.boolean(),
  //password: Joi.string().required(),

  //   .required()
  //   .messages({
  //     "string.pattern.base":
  //       "Mobile number must be digits.",
  //     "any.required": "Mobile number is required.",
  //   }),
  password: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,30}$"
      )
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must be 8-30 characters, including uppercase, lowercase, number & special character.",
    }),
  // confirm_password: Joi.string().required().valid(Joi.ref("password")),
  // status: Joi.string(),
  // userType: Joi.string().required(),
  // country: Joi.string().required(),
  // state: Joi.string().required(),
  // city: Joi.string().required(),
  // zipCode: Joi.string().required()
});

const userSignup = async (req, res) => {
  // const session = await mongoose.startSession();
  // session.startTransaction();

  try {

    await schema.validateAsync(req.body)
    // const { error, value } = schema.validate(req.body, { abortEarly: false });

    // if (error) {
    //   console.error("Validation Error:", error);
    //   return res
    //     .status(400)
    //     .json({ success: false, message: error.details[0].message });
    // }

    const {
      country,
      password,
      magicLink,
      email,
      isMedia,
      mobile,
      status,
      userType,
      first_Name,
      last_Name,
    } = req.body;

    // const deleteEmailExist = await findOneAndSelect("user", { email, status: "InActive" });
    // if (deleteEmailExist) {
    //   await deleteDocument("user", { email });
    // }
    let user
    // const emailExist = await findOneAndSelect("user", { email});
    user = await findOneAndSelect("user", {
      email,
      // userType,
      // status: "Active",
    });

    if (user) {
      if (!user?.password) {
        return res
          .status(400)
          .send({ status: 400, message: "No Password found" });
      }
      const passwordIsValid = bcrypt.compareSync(password, user?.password);
      if (!passwordIsValid) {

        return res
          .status(400)
          .send({ status: 400, message: "Invalid Email or Password!" });
      }
    }
    if (!user) {
      req.body.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
      user = await insertNewDocument("user", {

        email,
        password: req.body.password


      });
    }
    // const mobileExist = await findOneAndSelect("user", { mobile, status: "Active" });
    // if (mobileExist) {
    //   return res
    //     .status(400)
    //     .send({ status: 400, message: "Mobile number already exists with this email" });
    // }
    // const user_type = await findOne("userType", { type });

    // if (!user_type) {
    //   return res
    //     .status(401)
    //     .send({ status: 401, message: "No User Type Found" });
    // }


    // const userCount = await getAggregate("user", [
    //   {
    //     $match: { status: "Active", userType: "pro" },
    //   },
    //   { $count: "activeProUsers" },
    //   {
    //     $sort: {
    //       _id: -1,
    //     },
    //   },
    // ]);
    // const user = await findOne("user", {

    //   email,


    // });



    var token = jwt.sign({ id: user._id, role: user }, ACCESS_TOKEN_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    var refresh_token = jwt.sign({ id: user._id, role: user }, REFRESH_TOKEN_SECRET, {
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

    req.userId = user._id;
    if (magicLink) {
      console.log("1");

      await magicLinkSend({ email })
      // await session.commitTransaction();
      // session.endSession();
      return res.json({
        status: 200,
        message: "Magic Link sent to your email. Check inbox to proceed.",
        data: {
          user,
          //  token, refresh_token
        },
      });
    } else if (isMedia) {
      return res.json({
        status: 200,
        // message: "Magic Link sent to your email. Check inbox to proceed.",
        data: {
          user,
          //  token, refresh_token
        },
      });
    }

    else {

      await sendOTPSignup({ email })
      // await session.commitTransaction();
      // session.endSession();
      return res.json({
        status: 200,
        message: "OTP sent to your email. Check inbox to proceed.",
        data: {
          user,
          //  token, refresh_token
        },
      });
    }

    //   return res.status(200).send({ status: 200, data:{user, token} });
  } catch (error) {
    //  await session.abortTransaction();
    // session.endSession();
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(400).send({
        status: 400,
        message: "Email already exists. Please use a different email.",
      });
    }
    // Handle other errors
    console.error("Error saving user:", error);
    return res.status(400).send({ status: 400, error});
    //  return res.status(400).send({ status: 400, message: e.message });
  }
};

export default userSignup;
