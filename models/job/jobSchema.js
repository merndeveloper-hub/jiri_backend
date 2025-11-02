import mongoose from "mongoose";
import SchemaType from "../../types/index.js";


// Jobs Schema (for GDPR export/delete)
const jobSchema = new mongoose.Schema(
  {
    jobId: {
      type: SchemaType.TypeString,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: SchemaType.ObjectID,
      ref: "User",
      required: true,
    },
    firebaseUid: {
      type: SchemaType.TypeString,
    //  required: true,
      index: true,
    },
    type: {
      type: SchemaType.TypeString,
      enum: ["export", "delete", "voice_train", "tts_generate"],
      required: true,
    },
    status: {
      type: SchemaType.TypeString,
      enum: ["queued", "running", "completed", "failed"],
      default: "queued",
    },
    payload: {
      type: SchemaType.TypeString,
    },
    resultUrl: {
      type: SchemaType.TypeString,
    },
    error: {
      type: SchemaType.TypeString,
    },
  },
  { timestamps: true }
);

export default jobSchema;