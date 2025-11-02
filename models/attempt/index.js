import mongoose from "mongoose";
import attemptSchema from "./attemptSchema.js";

const attempt = mongoose.model("attempt", attemptSchema);

export default attempt;
