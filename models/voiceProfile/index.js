import mongoose from "mongoose";
import voiceProfileSchema from "./voiceProfileSchema.js";

const voiceProfile = mongoose.model("voiceProfile", voiceProfileSchema);

export default voiceProfile;
