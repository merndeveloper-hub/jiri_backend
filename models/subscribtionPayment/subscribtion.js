import mongoose from "mongoose";
import SchemaType from "../../types/index.js";

// Subscription Transaction Schema
const subscriptionTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: SchemaType.TypeObjectId,
      ref: "User",
    
    },
    stripeSessionId: {
      type: SchemaType.TypeString,
   
    },
    stripeSubscriptionId: {
      type: SchemaType.TypeString,
   
    },
    stripeCustomerId: {
      type: SchemaType.TypeString,
     
    },
    priceId: {
      type: SchemaType.TypeString,
      
    },
    amount: {
      type: SchemaType.TypeNumber,
      
    },
    currency: {
      type: SchemaType.TypeString,
      default: "usd",
      lowercase: true
    },
    status: {
      type: SchemaType.TypeString,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
     
    },
    plan: {
      type: SchemaType.TypeString,
      enum: ["pro", "family"],
     
    },
    billingCycle: {
      type: SchemaType.TypeString,
      enum: ["monthly", "yearly"],
      
    },
    paymentStatus: {
      type: SchemaType.TypeString,
      enum: ["unpaid", "paid", "failed"],
      default: "unpaid"
    },
    metadata: {
      sessionUrl: {
        type: SchemaType.TypeString,
      },
      completedAt: {
        type: SchemaType.TypeString,
      },
      cancelledAt: {
        type: SchemaType.TypeString,
      },
      subscriptionStatus: {
        type: SchemaType.TypeString,
      },
      failureReason: {
        type: SchemaType.TypeString,
      }
    }
  },
  { timestamps: true }
);



export default subscriptionTransactionSchema;