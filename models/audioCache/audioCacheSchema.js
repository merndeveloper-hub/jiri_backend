import mongoose from "mongoose";
import SchemaType from "../../types/index.js";


// Generated Audio Cache Schema
const audioCacheSchema = new mongoose.Schema(
  {
    userId: {
      type: SchemaType.ObjectID,
      ref: "User",
      required: true,
    },
    storyId: {
      type: SchemaType.TypeString,
      required: true,
     // index: true,
    },
    voiceType: {
      type: SchemaType.TypeString,
      required: true,
    },
    audioUrl: {
      type: SchemaType.TypeString,
      required: true,
    },
    expiresAt: {
      type: SchemaType.TypeDate,
      required: true,
    },
    isFavorited: {
      type: SchemaType.TypeBoolean,
      default: false,
    },
  },
  { timestamps: true }
);
export default audioCacheSchema;