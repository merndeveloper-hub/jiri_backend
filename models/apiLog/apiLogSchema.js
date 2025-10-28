import mongoose from "mongoose";
import schemaType from "../../types/index.js";

const apiLogSchema = new mongoose.Schema(
  {
    userId: {
      type: schemaType.TypeObjectId,
      ref: "user",
    },
    route: {
      type: schemaType.TypeString,
    },
    method: {
      type: schemaType.TypeString,
    },
    statusCode: {
      type: schemaType.TypeNumber,
    },
    reqHeaders: {
      type: Object,
    },
    reqBody: {
      type: Object,
    },
    resBody: {
      type: mongoose.Schema.Types.Mixed,
    },
    responseTime: {
      type: schemaType.TypeNumber,
    },
    ip: {
      type: schemaType.TypeString,
    },
    reqId: {
      type: schemaType.TypeString,
    },
    created_date: {
      type: schemaType.TypeDate,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default apiLogSchema;


//export const ApiLog = mongoose.model("ApiLog", apiLogSchema);
