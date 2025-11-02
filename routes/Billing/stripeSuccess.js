



// import Stripe from "stripe";
// //import { updateDocument,findAndSort } from "../../helpers/index.js";

// let stripe = new Stripe(process.env.STRIPE_SECRET_KEY);




// const stripeSuccess = async(req, res) => {
//   try {



//     const [session, lineItems] = await Promise.all([
//       stripe.checkout.sessions.retrieve(req.query.session_id, {
//         expand: ['payment_intent.payment_method'],
//       }),
//       stripe.checkout.sessions.listLineItems(req.query.session_id),
//     ]);


//         // Debug log
//         console.log("Stripe session: ", JSON.stringify(session, null, 2));
//         console.log("Line items: ", JSON.stringify(lineItems, null, 2));

//         // const { card } = session.payment_intent.payment_method;

//         // const cardDetails = {
//         //   cardBrand: card?.brand,
//         //   cardLast4: card?.last4,
//         //   cardExpMonth: card?.exp_month,
//         //   cardExpYear: card?.exp_year,
//         //   cardFunding: card?.funding,
//         //   cardCountry: card?.country,
//         // };
// // // Pehle se saved totalAmount nikal lo (agar hai)
// // const lastPayment = await findAndSort("userPayment", { stripeSessionId: session.id,sender:'User' },{ createdAt: -1  });

// // // Agar last totalAmount hai to use le lo, warna 0
// // const previousAmount = lastPayment?.totalAmount || 0;

// // // Ab ka amount (req.body se)
// // const currentAmount = amount || 0;

// // // Total calculate karo
// // const totalAmount = previousAmount + currentAmount;
// //         if (session.payment_status === "paid") {
// //           // Example: find and update existing payment document
// //           await updateDocument(
// //             "userPayment",
// //             { stripeSessionId: session.id },
// //             {
// //               status: "Success",
// //               totalAmount,
// //               paymentIntentId: session.payment_intent?.id || null,
// //               paymentMethod: session.payment_intent?.payment_method?.type || "card",
// //               transactionId: session.payment_intent?.id,
// //               presentmentAmount: session.payment_intent?.presentment_details?.presentment_amount,
// //               presentmentCurrency: session.payment_intent?.presentment_details?.presentment_currency,
// //               cardDetails,
// //               paidAt: new Date(session.created * 1000),
// //               customerEmail: session.customer_details?.email || null,
// //             }
// //           );
// //         }


//     return res.send("<html><body style='background:#fff;'></body></html>");
//   } catch (error) {
//     return res.status(400).json({ status: 400, message: error.message });
//   }
// };

// export default stripeSuccess;









// ============================================
// GET /api/v1/billing/stripesuccess
// ============================================

import Stripe from "stripe";
import { findOne, updateDocument } from "../../helpers/index.js";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const stripeSuccess = async (req, res) => {
    try {
        const sessionId = req.query.session_id;

        if (!sessionId) {
            return res.status(400).send({
                status: 400,
                message: "Session ID is required"
            });
        }

        // ✅ Retrieve session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['subscription', 'customer']
        });

        console.log("✅ Session retrieved:", session.id);

        if (session.payment_status !== 'paid') {
            return res.status(400).send({
                status: 400,
                message: "Payment not completed"
            });
        }

        const userId = session.metadata.userId;
        const subscription = session.subscription;

        // ✅ Get subscription details
        const subscriptionDetails = typeof subscription === 'string'
            ? await stripe.subscriptions.retrieve(subscription)
            : subscription;

        console.log("✅ Subscription details:", subscriptionDetails.id);

        // ✅ Update user in database
        await updateDocument("user", { _id: userId }, {
            plan: session.metadata.plan,
            subscriptionStatus: subscriptionDetails.status || "active",
            stripeSubscriptionId: subscriptionDetails.id,
            stripeCustomerId: session.customer.id,
            subscriptionDetails: {
                priceId: session.metadata.priceId,
                productId: subscriptionDetails.items.data[0].price.product,
                currentPeriodStart: new Date(subscriptionDetails.current_period_start * 1000),
                currentPeriodEnd: new Date(subscriptionDetails.current_period_end * 1000),
                cancelAtPeriodEnd: subscriptionDetails.cancel_at_period_end,
                trialStart: subscriptionDetails.trial_start ? new Date(subscriptionDetails.trial_start * 1000) : null,
                trialEnd: subscriptionDetails.trial_end ? new Date(subscriptionDetails.trial_end * 1000) : null
            }
        });

        // ✅ Update transaction status
        // await SubscriptionTransaction.findOneAndUpdate(
        //   { stripeSessionId: sessionId },
        //   { 
        //     status: "completed",
        //     stripeSubscriptionId: subscriptionDetails.id,
        //     metadata: {
        //       completedAt: new Date().toISOString(),
        //       subscriptionStatus: subscriptionDetails.status
        //     }
        //   }
        // );

        await updateDocument("subscriptionTransaction", { stripeSessionId: sessionId },
            {
                status: "completed",
                paymentStatus: "paid",
                stripeSubscriptionId: subscriptionDetails.id,
                metadata: {
                    completedAt: new Date().toISOString(),
                    subscriptionStatus: subscriptionDetails.status,
                    paymentStatus: session.payment_status
                }
            })

        console.log("✅ User subscription activated for userId:", userId);

        // ✅ Redirect to success page
        // return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscription/success?plan=${session.metadata.plan}`);
        return res.send("<html><body style='background:#fff;'></body></html>");
    } catch (error) {
        console.error("❌ Error handling success:", error);
        return res.status(500).send({
            status: 500,
            message: error.message || "An unexpected error occurred."
        });
    }
};

export default stripeSuccess;