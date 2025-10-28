import mongoose from "mongoose";
import userSchema from "./userSchema.js";

const user = mongoose.model("users", userSchema);

export default user;
