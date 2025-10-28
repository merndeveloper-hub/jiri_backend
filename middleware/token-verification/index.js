import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../../config/index.js";
import { findOne } from "../../helpers/index.js";


const tokenVerification = (req, res, next) => {
  try {

    console.log(req, "req");
    let token = req?.cookies?.token;  // ✅ sirf JWT milega

    //let token = req.headers['cookie']
    //    let token = req.headers["token"];
    //console.log(token,"token");

    if (!token) {
      return res
        .status(401)
        .send({ status: 401, message: "No token provided!" });
    }

    console.log(ACCESS_TOKEN_SECRET, "SCERT");

    jwt.verify(token, ACCESS_TOKEN_SECRET, async (err, decoded) => {
      //console.log(decoded,"decoded");

      if (err) {
        console.log(err);
        return res
          .status(401)
          .send({ status: 401, message: "Token Unauthorized!" });
      }
      // if (!decoded.user) {
      // 	return res.status(400).send({ status: 400, message: "Upgrade your token" });
      // }
      const isUserExist = await findOne("user", { _id: decoded.id });
      console.log(isUserExist, "isuer");

      if (!isUserExist) {
        return res.status(401).send({
          status: 401,
          message: "User does not exist with your token",
        });
      }
      req.userId = isUserExist._id;
      req.user = isUserExist;
      next();
    });
  } catch (e) {
    console.log("Token verification Error", e.message);
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default tokenVerification;
