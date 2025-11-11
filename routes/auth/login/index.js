import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  JWT_EXPIRES_IN,
  JWT_EXPIRES_IN_REFRESH_TOKEN,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_SECRET,
} from "../../../config/index.js";
import {
  findOneAndSelect,
  findOne,
  insertNewDocument,
  updateDocument,
  find,
  deleteManyDocument,
} from "../../../helpers/index.js";
import Joi from "joi";
import send_email from "../../../lib/node-mailer/index.js";

const schema = Joi.object({
  email: Joi.string().email().required(),
  // password: Joi.string().required(),
  // userType: Joi.string().required(),
});

const loginUser = async (req, res) => {
  const { email } = req.body;

  try {
    await schema.validateAsync(req.body);

    const user = await findOneAndSelect("user", {
      email,
      // userType,
      // status: "Active",
    });

    if (user) {
  
      const updateAttempt = await findOne("attempt", { user_id: user._id });
      if (updateAttempt) {
        const blockTime = new Date(updateAttempt?.block_duration).getTime();
        const now = new Date().getTime();
        const diff = blockTime > now ? true : false;
        const diffMs = blockTime - now;
        if (updateAttempt.block && updateAttempt.no_of_attempt === 6 && diff) {
          return res.status(400).send({
            status: 400,
            message: `You are blocked for ${Math.round(
              (diffMs % 86400000) / 60000
            )} minutes`,
          });
        }
        if (updateAttempt.block && updateAttempt.no_of_attempt >= 11 && diff) {
          const hrs =
            Math.round((diffMs % 86400000) / 3600000 - 1) <= 0
              ? ""
              : `${Math.round((diffMs % 86400000) / 3600000 - 1)} hr & `;
          const minutes = Math.round(((diffMs % 86400000) % 3600000) / 60000);
          return res.status(400).send({
            status: 400,
            message: `You are blocked for ${hrs}${minutes} minutes`,
          });
        }
      }
      if (user.status === "Disabled") {
        return res
          .status(400)
          .send({ status: 400, message: "Your account is Disabled" });
      }
      user.password = undefined;
      const resetAttempt = await updateDocument(
        "attempt",
        {
          user_id: user._id,
        },
        {
          no_of_attempt: 0,
          block: false,
          // block_duration: null,
        }
      );

      var token = jwt.sign(
        { id: user._id, role: user.userType },
        ACCESS_TOKEN_SECRET,
        {
          expiresIn: JWT_EXPIRES_IN,
        }
      );
      var refresh_token = jwt.sign(
        { id: user._id, role: user.userType },
        REFRESH_TOKEN_SECRET,
        {
          expiresIn: JWT_EXPIRES_IN_REFRESH_TOKEN,
        }
      );

    

      let restToken = await deleteManyDocument("token", { user_id: user._id });
      const inserttoken = await insertNewDocument("token", {
        user_id: user._id,
        accessToken: token,
        refreshToken: refresh_token,
        type: "refresh",
      });
      req.userId = user._id;

      // Set Access Token in Cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false, // sirf prod me https
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24, // 1 day (ya JWT_EXPIRES_IN ke hisaab se)
      });

      // Set Refresh Token in Cookie (optional)
      res.cookie("refreshToken", refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 din
      });

    //  let fcmTokens = await find("token", { user_id: user._id });
      //res.cookie("refreshToken", refresh_token, { httpOnly: true, secure: true, sameSite: "Strict" });

      return res
        .status(200)
        .send({
          status: 200,
          data: { user , refresh_token },
        });
    } else {
      return res
        .status(400)
        .send({ status: 400, message: "User does not exist!" });
    }
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
};

export default loginUser;
