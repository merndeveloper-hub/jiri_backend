import mongoose from "mongoose";
mongoose.Promise = global.Promise;

import userType from "./userType/index.js";
import user from "./user/index.js";
import attempt from "./attempts/index.js";
import userOTP from "./otpVerification/index.js";

import token from "./token/index.js";

import apiLog from "./apiLog/index.js";


const db = {};

db.mongoose = mongoose;

// const db = {
//   userType: "./userType/index.js"

// };


db.apiLog = apiLog
db.user = user

db.userType = userType;
db.attempt = attempt
db.userOTP = userOTP;

db.token = token




export default db;
