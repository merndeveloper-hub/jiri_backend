import mongoose from "mongoose";
import schemaType from "../../types/index.js";

const userTypeSchema = new mongoose.Schema(
  {
    type: {
      type: schemaType.TypeString,
   
    },
    status: {
      type: schemaType.TypeString,
      default: "Active",
    },
  },
  { timestamps: true }
);

export default userTypeSchema;
