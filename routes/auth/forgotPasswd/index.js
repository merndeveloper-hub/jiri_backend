import Joi from "joi";
import {

  findOneAndSelect,
  updateDocument
} from "../../../helpers/index.js";



import bcrypt from "bcryptjs";


const schema = Joi.object({
  // userType: Joi.string(),
  email: Joi.string()
    .email({ tlds: { allow: true } }) // Ensures a valid domain with TLD (e.g., .com, .org)
    .pattern(
      new RegExp(
        "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
      )
    ) // Enforces common email rules
    .required()
    .messages({
      "string.email": "Invalid email format.",
      "any.required": "Email is required.",
      "string.pattern.base": "Invalid email structure.",
    }),

  password: Joi.string()
    // .pattern(
    //   new RegExp(
    //     "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,30}$"
    //   )
    // )
    .required()
    .messages({
      "string.pattern.base":
        "Password is required.",
    }),
  confirm_password: Joi.string().required().valid(Joi.ref("password")),

});

const forgotPaasswd = async (req, res) => {


  try {
    await schema.validateAsync(req.body)


    const { password, email } = req.body;

    const emailExist = await findOneAndSelect("user", { email });
    if (!emailExist) {
      return res
        .status(401)
        .send({ status: 401, message: "No user found with this email address" });
    }



    req.body.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));




    const user_passwd_updated = await updateDocument(
      "user",
      { email },
      { password: req.body.password }

    );




    return res.status(200).send({ status: 200, message: "Password updated successfully" });
  } catch (e) {

    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default forgotPaasswd;
