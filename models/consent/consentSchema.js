import mongoose from "mongoose";
import SchemaType from "../../types/index.js";


// Consents Schema
const consentSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: SchemaType.TypeString,
     
    },
    userId: {
      type: SchemaType.ObjectID,
      ref: "User",
     
    },
    consentKey: {
      type: SchemaType.TypeString,
     
    },
    type: {
      type: SchemaType.TypeString,
     
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