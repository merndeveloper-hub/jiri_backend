import mongoose from "mongoose";
import tokenSchema from "./tokenSchema.js";

const token = mongoose.model("token", tokenSchema);

export default token;
