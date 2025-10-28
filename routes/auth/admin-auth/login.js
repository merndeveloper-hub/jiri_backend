import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
//const { ACCESS_TOKEN_SECRET } = require("../../../config");
import { findOneAndSelect } from "../../../helpers/index.js";
import Joi from "joi";


const schema = Joi.object({
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

const adminLogin = async (req, res) => {
  const { email, password, userType } = req.body;
  try {
    console.log(req.body, "body---");

    await schema.validateAsync(req.body);
    const user = await findOneAndSelect(
      "user",
      { email, userType }
    );
    // const user = await getAggregate("user", [
    //   {
    //     $match: {
    //       email,
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "user-types",
    //       localField: "type",
    //       foreignField: "_id",
    //       as: "type",
    //     },
    //   },
    //   {
    //     $unwind: "$type",
    //   },
    //   {
    //     $project: {
    //       followers: 0,
    //       following: 0,
    //     },
    //   },
    // ]);
    console.log(user, "user----");

    if (user) {


      if (!user?.password) {
        return res
          .status(401)
          .send({ status: 400, message: "No Password found" });
      }
      const passwordIsValid = bcrypt.compareSync(password, user?.password);
      if (!passwordIsValid) {
        return res
          .status(400)
          .send({ status: 400, message: "Invalid Email or Password!" });
      }
      if (user.status === "Disabled") {
        return res
          .status(400)
          .send({ status: 400, message: "Your account is Disabled" });
      }
      user.password = undefined;
      var token = jwt.sign({ id: user._id }, "ACCESS_TOKEN_SECRET", {
        expiresIn: "24h",
      });
      req.userId = user._id;

      res.status(200).send({ status: 200, user: user, token });
    } else {
      return res
        .status(401)
        .send({ status: 401, message: "User does not exist!" });
    }
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
};

export default adminLogin;
