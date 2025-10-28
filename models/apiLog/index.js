import mongoose from "mongoose";
import apiLogSchema from"./apiLogSchema.js";

const apiLog = mongoose.model("apiLog", apiLogSchema);

export default apiLog;
