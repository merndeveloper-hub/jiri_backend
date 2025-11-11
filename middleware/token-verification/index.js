import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../../config/index.js";
import { findOne } from "../../helpers/index.js";


const tokenVerification = (req, res, next) => {
  try {

   
    let token = req?.cookies?.token;  


    if (!token) {
      return res
        .status(401)
        .send({ status: 401, message: "No token provided!" });
    }

   

    jwt.verify(token, ACCESS_TOKEN_SECRET, async (err, decoded) => {
     

      if (err) {
       
        return res
          .status(401)
          .send({ status: 401, message: "Token Unauthorized!" });
      }
    
      const isUserExist = await findOne("user", { _id: decoded.id });
    

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
  
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default tokenVerification;
