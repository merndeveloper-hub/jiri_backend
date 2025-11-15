
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

        //  Retrieve session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['subscription', 'customer']
        });

        console.log(" Session retrieved:", session.id);

        if (session.payment_status !== 'paid') {
            return res.status(400).send({
                status: 400,
                message: "Payment not completed"
            });
        }

        const userId = session.metadata.userId;
        const subscription = session.subscription;

        //  Get subscription details
        const subscriptionDetails = typeof subscription === 'string'
            ? await stripe.subscriptions.retrieve(subscription)
            : subscription;

        console.log(" Subscription details:", subscriptionDetails.id);

        //  Update user in database
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

        //  Update transaction status
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

        console.log(" User subscription activated for userId:", userId);

              return res.send("<html><body style='background:#fff;'></body></html>");
    } catch (error) {
        console.error(" Error handling success:", error);
        return res.status(500).send({
            status: 500,
            message: error.message || "An unexpected error occurred."
        });
    }
};

export default stripeSuccess;