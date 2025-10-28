import mongoose from "mongoose";
import schemaType from "../../types/index.js";

const userOTPVerificationSchema = new mongoose.Schema(
  {
    userEmail: schemaType.TypeString,
     userType: { type: schemaType.TypeString, enum: ["user", "pro"] }, // Identifies the user type
    otp: schemaType.TypeString,
    status:{ type: schemaType.TypeString, enum: ["Pending", "Expired","Approved"] },
    createdAt: Date,
    expiresAt: Date,// This will store the expiration time
},
  { timestamps: true }
);

export default userOTPVerificationSchema;
