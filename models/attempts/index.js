import mongoose from "mongoose";
import attemptSchema from "./attemptsSchema.js";

const attempts = mongoose.model("attempts", attemptSchema);

export default attempts;
