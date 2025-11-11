import mongoose from "mongoose";
import SchemaType from "../../types/index.js";


// Generated Audio Cache Schema
const audioCacheSchema = new mongoose.Schema(
  {
    userId: {
      type: SchemaType.ObjectID,
      ref: "User",
     
    },
    storyId: {
      type: SchemaType.TypeString,
   
    },
    voiceType: {
      type: SchemaType.TypeString,
     
    },
    audioUrl: {
      type: SchemaType.TypeString,
     
    },
    expiresAt: {
      type: SchemaType.TypeDate,
    
    },
    isFavorited: {
      type: SchemaType.TypeBoolean,
      default: false,
    },
  },
  { timestamps: true }
);
export default audioCacheSchema;