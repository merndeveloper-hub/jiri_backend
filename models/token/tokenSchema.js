import mongoose from "mongoose";
import SchemaType from "../../types/index.js";

const tokenSchema = new mongoose.Schema(
  {
    user_id: {
      type: SchemaType.ObjectID,
      ref: "user",
   //  required: true,
    },
    accessToken: {
      type: SchemaType.TypeString,
      //required: true,
     // unique: true
    },
     refreshToken: {
      type: SchemaType.TypeString,
      //required: true,
     // unique: true
    },
    fcmToken:{
      type:SchemaType.TypeString
    },
    expiresAt: {
      type: SchemaType.TypeDate,
    },
    type: {
      type: SchemaType.TypeString,
      enum: ['access', 'refresh'],
      //required: true
    }
  },
  { timestamps: true }
);



export default tokenSchema;


