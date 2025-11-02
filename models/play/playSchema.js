import mongoose from "mongoose";
import SchemaType from "../../types/index.js";


// Plays/Usage Tracking Schema
const playSchema = new mongoose.Schema(
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
    storyId: {
      type: SchemaType.TypeString,
      required: true,
      index: true,
    },
    voiceType: {
      type: SchemaType.TypeString,
      enum: ["default", "cloned", "preset"],
      default: "default",
    },
    monthKey: {
      type: SchemaType.TypeString,
      index: true,
    },
    timestamp: {
      type: SchemaType.TypeDate,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default playSchema;