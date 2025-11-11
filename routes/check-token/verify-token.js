import jwt from "jsonwebtoken";
import {
  JWT_EXPIRES_IN,
  JWT_EXPIRES_IN_REFRESH_TOKEN,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from "../../config/index.js";
import { findOne, insertNewDocument, deleteManyDocument } from "../../helpers/index.js";

const refreshAccessToken = async (req, res) => {
  try {
    let { refreshToken, id } = req.body;

    if (!refreshToken) {
      return res
        .status(401)
        .send({ status: 401, message: "No refresh token provided!" });
    }

    // Step 1: Check if refresh token exists in DB
    const isTokenExist = await findOne("token", { refreshToken });
    if (!isTokenExist) {
      return res
        .status(401)
        .send({ status: 401, message: "Refresh token not found in DB!" });
    }
console.log(isTokenExist,"istoken");

    // Step 2: Verify refresh token
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .send({ status: 401, message: "Invalid or expired refresh token!" });
      }

      // Step 3: Verify user exist
      const isUserExist = await findOne("user", { _id: id });
      if (!isUserExist) {
        return res
          .status(401)
          .send({ status: 401, message: "User not found!" });
      }

      // Step 4: Create new access token
      const newAccessToken = jwt.sign(
        { id: isUserExist._id, role: isUserExist.role },
        ACCESS_TOKEN_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Optional: Rotate refresh token (security best practice)
      const newRefreshToken = jwt.sign(
        { id: isUserExist._id, role: isUserExist.role },
        REFRESH_TOKEN_SECRET,
        { expiresIn: JWT_EXPIRES_IN_REFRESH_TOKEN }
      );

      //  Step 5: Delete all old tokens of this user
      await deleteManyDocument("token", { user_id: isUserExist._id });

      //  Step 6: Insert fresh token record
      await insertNewDocument("token", {
        user_id: isUserExist._id,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        type: "refresh",
        createdAt: new Date(),
        updatedAt: new Date(),
      });


       // Set Access Token in Cookie
      res.cookie("token", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false, // sirf prod me https
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24, // 1 day (ya JWT_EXPIRES_IN ke hisaab se)
      });

      // Set Refresh Token in Cookie (optional)
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 din
      });

      return res.status(200).send({
        status: 200,
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });
    });
  } catch (e) {
    console.log("Token Refresh Error:", e.message);
    return res.status(500).send({ status: 500, message: e.message });
  }
};

export default refreshAccessToken;
