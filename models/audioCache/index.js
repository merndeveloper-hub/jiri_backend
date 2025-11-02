import mongoose from "mongoose";
import audioCacheSchema from "./audioCacheSchema.js";

const audioCache = mongoose.model("audioCache", audioCacheSchema);

export default audioCache;
