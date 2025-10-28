// const jwt = require("jsonwebtoken");
import bcrypt from "bcryptjs";
// const { ACCESS_TOKEN_SECRET } = require("../../../config");
import {
  findOneAndSelect,
  insertNewDocument,
} from "../../../helpers/index.js";
import Joi from "joi";


const schema = Joi.object({
  first_Name: Joi.string().min(3).required(),
  last_Name: Joi.string().min(3).required(),
  email: Joi.string()
    .email({ tlds: { allow: true } }) // Ensures a valid domain with TLD (e.g., .com, .org)
    .pattern(new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) // Enforces common email rules
    .required()
    .messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
      "string.pattern.base": "Invalid email structure",
    }),
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
  userType: Joi.string().required(),
});

const adminSignup = async (req, res) => {
  const { email, password, userType } = req.body;
  try {
    await schema.validateAsync(req.body);
    // const checkType = await findOne("userType", { type });
    // if (!checkType) {
    //   return res.status(400).send({
    //     status: 400,
    //     message: "No Type found",
    //   });
    // }
    const checkEmail = await findOneAndSelect(
      "user",
      { email }

    );
    if (checkEmail) {
      return res.status(400).send({
        status: 400,
        message: "User already exists",
      });
    }
    const user = await insertNewDocument("user", {
      mobile: '',
      userType,
      ...req.body,

      password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
    });
    user.password = undefined;
    // user.type = undefined;
    req.userId = user._id;

    return res.status(200).send({ status: 200, user });
  } catch (error) {

    if (error.code === 11000) {
      console.log(error, "error--------");

      // Duplicate key error
      return res.status(400).send({
        status: 400,
        message: "Email already exists. Please use a different email.",
      });
    }
    // Handle other errors
    console.error("Error saving user:", error);
    return res
      .status(400)
      .send({ status: 400, message: "An unexpected error occurred." });
    //  return res.status(400).send({ status: 400, message: e.message });

  }
};

export default adminSignup;
