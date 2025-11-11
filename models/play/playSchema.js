import mongoose from "mongoose";
import SchemaType from "../../types/index.js";


// Plays/Usage Tracking Schema
const playSchema = new mongoose.Schema(
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
      enum: ["default", "cloned", "preset"],
      default: "default",
    },
    monthKey: {
      type: SchemaType.TypeString,
    
    },
    timestamp: {
      type: SchemaType.TypeDate,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default playSchema;