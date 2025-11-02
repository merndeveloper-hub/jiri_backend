import mongoose from "mongoose";
import storySchema from "./storySchema.js";

const story = mongoose.model("story", storySchema);

export default story;
