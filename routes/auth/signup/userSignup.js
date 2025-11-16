import Joi from "joi";
import {
  findOne,
  insertNewDocument,
  findOneAndSelect,
} from "../../../helpers/index.js";
import {
  JWT_EXPIRES_IN,
  JWT_EXPIRES_IN_REFRESH_TOKEN,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_SECRET
} from "../../../config/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import sendOTPSignup from "../otpVerification/sendOTPSignup.js";
import magicLinkSend from "../otpVerification/magicLink.js";

// ---------------- VALIDATION ----------------
const schemaBetter = Joi.object({
  email: Joi.string()
    .email()
    .required(),

  isMedia: Joi.boolean().default(false),
  magicLink: Joi.boolean().default(false),

  password: Joi.alternatives().conditional(
    Joi.ref('isMedia'),
    {
      is: true,
      then: Joi.string().optional().allow(''),
      otherwise: Joi.alternatives().conditional(
        Joi.ref('magicLink'),
        {
          is: true,
          then: Joi.string().optional().allow(''),
          otherwise: Joi.string().required()
        }
      )
    }
  ).messages({
    "any.required": "Password is required"
  }),

  mobile: Joi.string().optional(),
  country: Joi.string().optional(),
  userType: Joi.string().optional(),
});

// ---------------- CONTROLLER ----------------
const userSignup = async (req, res) => {
  try {

    await schemaBetter.validateAsync(req.body);

    const {
      email,
      password,
      isMedia,
      magicLink
    } = req.body;

    let user = await findOneAndSelect("user", { email });

    // --------------- LOGIN FLOW ---------------
    if (user) {
      // Normal password login
      if (!isMedia && !magicLink) {
        if (!user.password) {
          return res.status(400).send({
            status: 400,
            message: "No Password found"
          });
        }

        if (!password) {
          return res.status(400).send({
            status: 400,
            message: "Password is required!"
          });
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
          return res.status(400).send({
            status: 400,
            message: "Invalid Email or Password!"
          });
        }
      }
    }

    // --------------- SIGNUP FLOW ---------------
    if (!user) {
      let hashPass = null;

      // Only hash password if password provided
      if (!isMedia && !magicLink) {
        hashPass = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
      }

      user = await insertNewDocument("user", {
        email,
        password: hashPass   // if media, password = null
      });
    }

    // ---------------- JWT TOKENS ----------------
    const token = jwt.sign({ id: user._id }, ACCESS_TOKEN_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    const refresh_token = jwt.sign({ id: user._id }, REFRESH_TOKEN_SECRET, {
      expiresIn: JWT_EXPIRES_IN_REFRESH_TOKEN,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "none"
    });

    res.cookie("refreshToken", refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: "none"
    });

    // ---------------- SEND MAGIC LINK / OTP ----------------
    if (magicLink) {
      await magicLinkSend({ email });
      return res.json({
        status: 200,
        message: "Magic Link sent.",
        data: { user, token, refresh_token }
      });
    }

    if (isMedia) {
      return res.json({
        status: 200,
        message: "Media login successful.",
        data: { user, token, refresh_token }
      });
    }

    // Otherwise OTP
    await sendOTPSignup({ email });

    return res.json({
      status: 200,
      message: "OTP sent.",
      data: { user, token, refresh_token }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).send({
        status: 400,
        message: "Email already exists",
      });
    }

    console.error("Error saving user:", error);
    return res.status(400).send({
      status: 400,
      message: error.message,
    });
  }
};

export default userSignup;
