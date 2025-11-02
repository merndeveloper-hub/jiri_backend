import mongoose from "mongoose";
import SchemaType from "../../types/index.js";

// Subscription Transaction Schema
const subscriptionTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: SchemaType.TypeObjectId,
      ref: "User",
     // required: true,
     // index: true
    },
    stripeSessionId: {
      type: SchemaType.TypeString,
     // unique: true,
      sparse: true
    },
    stripeSubscriptionId: {
      type: SchemaType.TypeString,
     // index: true
    },
    stripeCustomerId: {
      type: SchemaType.TypeString,
      required: true
    },
    priceId: {
      type: SchemaType.TypeString,
      required: true
    },
    amount: {
      type: SchemaType.TypeNumber,
      required: true
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
      index: true
    },
    plan: {
      type: SchemaType.TypeString,
      enum: ["pro", "family"],
      required: true
    },
    billingCycle: {
      type: SchemaType.TypeString,
      enum: ["monthly", "yearly"],
      required: true
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

// Indexes for faster queries
// subscriptionTransactionSchema.index({ userId: 1, createdAt: -1 });
// subscriptionTransactionSchema.index({ stripeSessionId: 1 });
// subscriptionTransactionSchema.index({ stripeSubscriptionId: 1 });
// subscriptionTransactionSchema.index({ status: 1 });

export default subscriptionTransactionSchema;