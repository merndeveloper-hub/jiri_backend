import mongoose from "mongoose";
mongoose.Promise = global.Promise;

import userType from "./userType/index.js";
import user from "./user/index.js";
import attempts from "./attempts/index.js";
import userOTP from "./otpVerification/index.js";
import attempt from "./attempt/index.js";
import token from "./token/index.js";

import apiLog from "./apiLog/index.js";
import story from "./story/index.js";
import voiceProfile from "./voiceProfile/index.js";
import play from "./play/index.js";
import consent from "./consent/index.js";
import job from "./job/index.js";
import audioCache from "./audioCache/index.js";
import subscriptionTransaction from "./subscribtionPayment/index.js";


const db = {};

db.mongoose = mongoose;

// const db = {
//   userType: "./userType/index.js"

// };

db.subscriptionTransaction=subscriptionTransaction
db.audioCache = audioCache
db.job = job
db.consent = consent
db.play = play
db.voiceProfile = voiceProfile
db.story = story
db.apiLog = apiLog
db.user = user

db.userType = userType;
db.attempts = attempts
db.userOTP = userOTP;
db.attempt = attempt
db.token = token




export default db;
