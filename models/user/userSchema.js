import mongoose from "mongoose";
import schemaType from "../../types/index.js";

const userSchema = new mongoose.Schema(
  {
    first_Name: {
      type: schemaType.TypeString,
    },
    last_Name: {
      type: schemaType.TypeString,
    },
    badge: {
      type: schemaType.TypeString,
    },
    totalJobCompleted: {
      type: schemaType.TypeNumber,
    },
    totalJobCancelled: {
      type: schemaType.TypeNumber,
    },
    totalJob: {
      type: schemaType.TypeNumber,
    },
    responseRate: {
      type: schemaType.TypeString,
    },
    responseTime: {
      type: schemaType.TypeString,
    },
    availability: {
      type: schemaType.TypeString,
    },
    bgCheck: {
      type: schemaType.TypeString,
    },
    totalRating: {
      type: schemaType.TypeNumber,
    },
    email: {
      type: schemaType.TypeString,
      unique: true,
    },
    profile: {
      type: schemaType.TypeString,
    },
    countryCode: {
      type: schemaType.TypeString,
    },
    video: {
      type: schemaType.TypeString,
    },
    address_Type: {
      type: schemaType.TypeString,
    },
    address_line1: {
      type: schemaType.TypeString,
    },
    address_line2: {
      type: schemaType.TypeString,
    },
    country: {
      type: schemaType.TypeString,
    },
    state: {
      type: schemaType.TypeString,
    },
    date: {
      type: schemaType.TypeString,
    },
    time: {
      type: schemaType.TypeString,
    },
    mobile: {
      type: schemaType.TypeString,
      // unique: true,
    },
    password: {
      type: schemaType.TypeString,
    },
    longitude: {
      type: schemaType.TypeString,
    },
    latitude: {
      type: schemaType.TypeString,
    },
    businessname: {
      type: schemaType.TypeString,
    },
    businessaddress: {
      type: schemaType.TypeString,
    },
    avgReviewsPro: {
      type: schemaType.TypeNumber,
    },
    totalReviewsPro: {
      type: schemaType.TypeNumber,
    },
    businessphoneNo: {
      type: schemaType.TypeString,
    },

    city: {
      type: schemaType.TypeString,
    },
    zipCode: {
      type: schemaType.TypeString,
    },
    totalPro: {
      type: schemaType.TypeNumber,
    },
    // totalAmount: {
    //   type: schemaType.TypeNumber,
    //   default: 0,
    // },
    paypalEmail: {
      type: schemaType.TypeString,
    }, // payout destination (must be verified PayPal email)

    // verifiedForPayaplPayout: {
    //   type: schemaType.TypeBoolean,
    //   default: false,
    // },
    //   availableAmount: { type: schemaType.TypeNumber, default: 0 }, // paisa/cents
    //  pendingAmount: { type: schemaType.TypeNumber, default: 0 },
    // chargesAmount: { type: schemaType.TypeNumber, default: 0 },
    created_date: {
      type: schemaType.TypeDate,
      default: Date.now,
    },
    // status: {
    //   type: schemaType.TypeString,
    //   enum: ["Active", "InActive", "AdminHideUser", "Disabled"],
    //   default: "Active",
    // },
    stripeAccountId: {
      type: schemaType.TypeString,
    },
    stripeAccountStatus: {
      type: schemaType.TypeString,
    },
    onboardingCompleteStripe: {
      type: schemaType.TypeBoolean,
    },
    stripeAccountDisconnectedAt: {
      type: schemaType.TypeString,
    },
    paypalEmail: {
      type: schemaType.TypeString,
    },
    paypalFirstName: {
      type: schemaType.TypeString,
    },
    paypalLastName: {
      type: schemaType.TypeString,
    },
    paypalCountry: {
      type: schemaType.TypeString,
    },
    paypalConnected: {
      type: schemaType.TypeBoolean,
    },
    paypalVerified: {
      type: schemaType.TypeBoolean,
    },

    bookingRequestTime: { type: schemaType.TypeString },
    userType: { type: schemaType.TypeString, enum: ["user", "pro", "admin"] },
    // running numbers for quick display
    // totalEarnings: { type: schemaType.TypeNumber, default: 0 }, // total jobs completed (gross)
    // totalCharges: { type: schemaType.TypeNumber, default: 0 }, // plante charges remaining amount
    // netEarnings: { type: schemaType.TypeNumber, default: 0 }, // totalEarnings - totalCharges
    // currentBalance: { type: schemaType.TypeNumber, default: 0 }, // what admin still owes the Pro
  },
  { timestamps: true }
);

export default userSchema;
