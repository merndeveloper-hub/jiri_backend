import mongoose from "mongoose";
import SchemaType from "../../types/index.js";

// User Schema (replaces DynamoDB users table)
const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: SchemaType.TypeString,
    },
    password: {
      type: SchemaType.TypeString,
    },
    email: {
      type: SchemaType.TypeString,
      required: true,

    },
  profile: {
      type: SchemaType.TypeString,
    },
    name: {
      type: SchemaType.TypeString,
      trim: true
    },
    language: {
      type: SchemaType.TypeString,

    },
    plan: {
      type: SchemaType.TypeString,
      enum: ["free", "pro", "family"],
      default: "free",
    },
    subscriptionStatus: {
      type: SchemaType.TypeString,
      enum: ["active", "cancelled", "expired", "trialing", "past_due", "incomplete"],
      default: "active",
    },
    stripeCustomerId: {
      type: SchemaType.TypeString,

    },
    stripeSubscriptionId: {
      type: SchemaType.TypeString,

    },
    subscriptionDetails: {
      priceId: {
        type: SchemaType.TypeString,
      },
      productId: {
        type: SchemaType.TypeString,
      },
      currentPeriodStart: {
        type: SchemaType.TypeDate,
      },
      currentPeriodEnd: {
        type: SchemaType.TypeDate,
      },
      cancelAtPeriodEnd: {
        type: SchemaType.TypeBoolean,
        default: false
      },
      canceledAt: {
        type: SchemaType.TypeDate,
      },
      trialStart: {
        type: SchemaType.TypeDate,
      },
      trialEnd: {
        type: SchemaType.TypeDate,
      }
    },

    voiceProfileId: [
      {
        type: SchemaType.ObjectID,
        ref: "voiceProfile"
      },
    ],
    favorites: [
      {
        type: SchemaType.TypeString,
      },
    ],
    limits: {
      free_plays_used_month: {
        type: SchemaType.TypeNumber,
        default: 0,
        min: 0
      },
      cloned_plays_used_month: {
        type: SchemaType.TypeNumber,
        default: 0,
        min: 0
      },
      month_key: {
        type: SchemaType.TypeString,
        default: function () {
          return new Date().toISOString().slice(0, 7);
        }
      },
    },
    created_date: {
      type: SchemaType.TypeDate,
      default: Date.now
    }
  },
  { timestamps: true }
);



export default userSchema;