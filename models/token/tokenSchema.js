import mongoose from "mongoose";
import SchemaType from "../../types/index.js";

const tokenSchema = new mongoose.Schema(
  {
    user_id: {
      type: SchemaType.ObjectID,
      ref: "user",
   
    },
    accessToken: {
      type: SchemaType.TypeString,
     
    },
     refreshToken: {
      type: SchemaType.TypeString,
    
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
      
    }
  },
  { timestamps: true }
);



export default tokenSchema;


