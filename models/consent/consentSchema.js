import mongoose from "mongoose";
import SchemaType from "../../types/index.js";


// Consents Schema
const consentSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: SchemaType.TypeString,
     // required: true,
      index: true,
    },
      userId: {
          type: SchemaType.ObjectID,
          ref: "User",
          required: true,
        },
    consentKey: {
      type: SchemaType.TypeString,
      required: true,
    },
    type: {
      type: SchemaType.TypeString,
      required: true,
    },
    version: {
      type: SchemaType.TypeString,
    },
    acceptedAt: {
      type: SchemaType.TypeDate,
      default: Date.now,
    },
    jurisdiction: {
      type: SchemaType.TypeString,
    },
    ip: {
      type: SchemaType.TypeString,
    },
    userAgent: {
      type: SchemaType.TypeString,
    },
  },
  { timestamps: true }
);

export default consentSchema;