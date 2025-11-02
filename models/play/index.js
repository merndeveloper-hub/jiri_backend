import mongoose from "mongoose";
import playSchema from "./playSchema.js";

const play = mongoose.model("play", playSchema);

export default play;
