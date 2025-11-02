import mongoose from "mongoose";
import jobSchema from "./jobSchema.js";

const job = mongoose.model("job", jobSchema);

export default job;
