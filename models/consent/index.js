import mongoose from "mongoose";
import consentSchema from "./consentSchema.js";

const consent = mongoose.model("consent", consentSchema);

export default consent;
