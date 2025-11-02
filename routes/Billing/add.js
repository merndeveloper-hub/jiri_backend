// // ============================================
// // PLAN & BILLING APIs - POST /app/subscriptions/checkout
// // ============================================

// import Joi from "joi";
// import { find, findOne, insertNewDocument, updateDocument } from "../../helpers/index.js";
// import Stripe from "stripe";

// let stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// const checkoutSchema = Joi.object({
//   priceId: Joi.string().required(),
// });

// const createCheckoutSession = async (req, res) => {
//   try {
//     await checkoutSchema.validateAsync(req.body);
    
//     const id = req.params.id;
//     const { priceId } = req.body;
//     let user = await findOne("user",{_id:id})
//     console.log(user,"user");
    
//     let customerId = user.stripeCustomerId;
//     if (!customerId) {
//       const customer = await stripe.customers.create({
//         email: user.email,
//      //   metadata: { firebaseUid: user.firebaseUid }
//       });
//       console.log(customer,"cus");
      
//       customerId = customer.id;
//       user.stripeCustomerId = customerId;
//       await updateDocument("user",{_id:id},{stripeCustomerId: user?.stripeCustomerId})
//     //  await user.save();
//     }
    
//     const session = await stripe.checkout.sessions.create({
//       customer: customerId || user?.stripeCustomerId,
//       mode: 'subscription',
//       payment_method_types: ['card'],
//       line_items: [{ price: priceId, quantity: 1 }],
//     //  success_url: `${process.env.APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
//      // cancel_url: `${process.env.APP_URL}/subscription/cancel`,
//       success_url: `http://localhost:5000/api/v1/billing/stripesuccess?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url:
//           "http://localhost:5000/api/v1/billing/stripecancel?session_id={CHECKOUT_SESSION_ID}",
//      // metadata: { firebaseUid: user.firebaseUid }
//     });
//     console.log(session,"session");
    
//     return res.status(200).send({
//       status: 200,
//       checkout: {
//         sessionId: session.id,
//         url: session.url
//       }
//     });
//   } catch (error) {
//     console.error("Error creating checkout session:", error);
//     return res.status(400).send({ 
//       status: 400, 
//       message: error.message || "An unexpected error occurred."
//     });
//   }
// };

// export default createCheckoutSession ;


// ============================================
// POST /app/subscriptions/checkout/:id
// ============================================

import Joi from "joi";
import { findOne, insertNewDocument, updateDocument } from "../../helpers/index.js";
import Stripe from "stripe";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Price ID to Plan mapping
const PRICE_TO_PLAN = {
  [process.env.STRIPE_PRO_MONTHLY_PRICE_ID]: { plan: "pro", cycle: "monthly" },
  [process.env.STRIPE_PRO_YEARLY_PRICE_ID]: { plan: "pro", cycle: "yearly" },
 // [process.env.STRIPE_FAMILY_MONTHLY_PRICE_ID]: { plan: "family", cycle: "monthly" },
 // [process.env.STRIPE_FAMILY_YEARLY_PRICE_ID]: { plan: "family", cycle: "yearly" },
};

const checkoutSchema = Joi.object({
  priceId: Joi.string().required(),
});

const createCheckoutSession = async (req, res) => {
  try {
    // ✅ Validate request
    await checkoutSchema.validateAsync(req.body);
    
    const userId = req.params.id;
    const { priceId } = req.body;
    console.log(priceId,"priceId");
    
    // ✅ Get user
    const user = await findOne("user", { _id: userId });
    
    if (!user) {
      return res.status(404).send({
        status: 404,
        message: "User not found"
      });
    }

    // ✅ Validate price ID
    const planInfo = PRICE_TO_PLAN[priceId];
    console.log(planInfo,"planifo");
    
    if (!planInfo) {
      return res.status(400).send({
        status: 400,
        message: "Invalid price ID"
      });
    }

    console.log("✅ User found:", user.email);
    
    // ✅ Handle Stripe Customer
    let customerId = user.stripeCustomerId;
    
    // Verify existing customer
    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId);
        console.log("✅ Existing customer verified:", customerId);
      } catch (error) {
        if (error.code === 'resource_missing') {
          console.log("⚠️ Customer not found in Stripe, creating new...");
          customerId = null;
        } else {
          throw error;
        }
      }
    }
    
    // Create new customer if needed
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { 
          userId: userId.toString(),
          mongoId: userId.toString()
        }
      });
      
      customerId = customer.id;
      
      await updateDocument("user", { _id: userId }, { 
        stripeCustomerId: customerId 
      });
      
      console.log("✅ New Stripe customer created:", customerId);
    }
    
    // ✅ Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ 
        price: priceId, 
        quantity: 1 
      }],
      success_url: `${process.env.APP_URL || 'http://15.207.221.76:5000'}/api/v1/billing/stripesuccess?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL || 'http://15.207.221.76:5000'}/api/v1/billing/stripecancel?session_id={CHECKOUT_SESSION_ID}`,
      metadata: { 
        userId: userId.toString(),
        priceId: priceId,
        plan: planInfo.plan,
        billingCycle: planInfo.cycle
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      subscription_data: {
        metadata: {
          userId: userId.toString(),
          plan: planInfo.plan
        }
      }
    });
    
    console.log("✅ Checkout session created:", session.id);
    
    // ✅ Save transaction to database
    // await SubscriptionTransaction.create({
    //   userId: userId,
    //   stripeSessionId: session.id,
    //   stripeCustomerId: customerId,
    //   priceId: priceId,
    //   amount: session.amount_total / 100, // Convert from cents
    //   currency: session.currency || 'usd',
    //   status: "pending",
    //   plan: planInfo.plan,
    //   billingCycle: planInfo.cycle,
    //   metadata: {
    //     sessionUrl: session.url
    //   }
    // });
await insertNewDocument("subscriptionTransaction",{
     userId: userId,
      stripeSessionId: session.id,
      stripeCustomerId: customerId,
      priceId: priceId,
      amount: session.amount_total / 100, // Convert from cents
      currency: session.currency || 'usd',
      status: "pending",
      plan: planInfo.plan,
      billingCycle: planInfo.cycle,
      metadata: {
        sessionUrl: session.url
}})

    
    return res.status(200).send({
      status: 200,
      checkout: {
        sessionId: session.id,
        url: session.url
      }
    });
    
  } catch (error) {
    console.error("❌ Error creating checkout session:", error);
    return res.status(500).send({ 
      status: 500, 
      message: error.message || "An unexpected error occurred."
    });
  }
};

export default createCheckoutSession;
    