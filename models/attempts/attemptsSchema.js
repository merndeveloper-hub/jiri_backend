import mongoose from "mongoose";
import SchemaType from "../../types/index.js";

const attemptSchema = new mongoose.Schema(
  {
    user_id: {
      type: SchemaType.ObjectID,
      ref: "user",
      required: true,
    },
    no_of_attempt: {
      type: SchemaType.TypeNumber,
      default: 0,
      required: true,
    },
    block_duration: {
      type: SchemaType.TypeDate,
      default: Date.now,
    },
    block: {
      type: SchemaType.TypeBoolean,
      default: false,
      enum: [true, false],
    },
  },
  { timestamps: true }
);

export default attemptSchema;
