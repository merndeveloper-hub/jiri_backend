import mongoose from "mongoose";
import SchemaType from "../../types/index.js";


// Voice Profile Schema
const voiceProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: SchemaType.ObjectID,
      ref: "User",
      required: true,
    },
    firebaseUid: {
      type: SchemaType.TypeString,
     // required: true,
      index: true,
    },
    voiceId: {
      type: SchemaType.TypeString,
      required: true,
    },
    name: {
      type: SchemaType.TypeString,
      default: "My Voice",
    },
    status: {
      type: SchemaType.TypeString,
      enum: ["training", "ready", "failed", "deleted"],
      default: "training",
    },
    modelPath: {
      type: SchemaType.TypeString,
    },
    sampleUrls: [
      {
        type: SchemaType.TypeString,
      },
    ],
  },
  { timestamps: true }
);


export default voiceProfileSchema;