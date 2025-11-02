import jwt from "jsonwebtoken";
import ACCESS_TOKEN_SECRET from "../../config/index.js";
import findOne from "../../helpers/index.js";

const adminVerification = async (req, res, next) => {
  try {
    let token = req.headers["token"];
    if (!token) {
      return res
        .status(401)
        .send({ status: 401, message: "No token provided!" });
    }
    jwt.verify(token, ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .send({ status: 400, message: "Token Unauthorized!" });
      }
      // if (!decoded.id) {
      //   return res
      //     .status(400)
      //     .send({ status: 400, message: "Upgrade your token" });
      // }
      const isUserExist = await findOne("user", { _id: decoded.id });
      if (!isUserExist) {
        return res.status(401).send({
          status: 401,
          message: "User does not exist with your token",
        });
      }
      const checkType = await findOne("userType", {
        _id: isUserExist.type,
      });
      if (!checkType) {
        return res.status(400).send({
          status: 400,
          message: "No user-type found",
        });
      }
      console.log("USerType", checkType);
      const accessArr = ["Owner", "Admin", "Moderator", "Creator", "Director"];
      if (!accessArr.includes(checkType.type)) {
        return res.status(400).send({
          status: 400,
          message: "You are not authorized to access this route",
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

export default adminVerification;


// / ============================================
// // ADMIN MIDDLEWARE - requireAdmin
// // ============================================
// const requireAdmin = async (req, res, next) => {
//   try {
//     const user = await User.findOne({ firebaseUid: req.firebaseUid });
//     if (!user || user.role !== 'admin') {
//       return res.status(403).send({
//         status: 403,
//         message: 'Admin access required'
//       });
//     }
//     next();
//   } catch (error) {
//     console.error("Error checking admin access:", error);
//     return res.status(500).send({ 
//       status: 500, 
//       message: error.message || "An unexpected error occurred."
//     });
//   }
// };

// export { requireAdmin };