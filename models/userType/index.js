import mongoose from "mongoose";
import userTypeSchema from"./user-type.schema.js";

const userType = mongoose.model("userType", userTypeSchema);

export default userType;
