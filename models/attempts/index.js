import mongoose from "mongoose";
import attemptSchema from "./attemptsSchema.js";

const attempt = mongoose.model("attempt", attemptSchema);

export default attempt;
