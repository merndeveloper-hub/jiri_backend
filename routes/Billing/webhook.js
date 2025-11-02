// ============================================
// POST /api/v1/billing/webhook
// ============================================

import Stripe from "stripe";
import { updateDocument } from "../../helpers/index.js";
import SubscriptionTransaction from "../../models/SubscriptionTransaction.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // ✅ Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("✅ Webhook event received:", event.type);

  // ✅ Handle different event types
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log("💳 Payment successful:", session.id);
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object;
        const userId = subscription.metadata.userId;

        await updateDocument("user", { _id: userId }, {
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: "active"
        });

        console.log("✅ Subscription created for user:", userId);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata.userId;

        await updateDocument("user", { _id: userId }, {
          subscriptionStatus: subscription.status,
          "subscriptionDetails.cancelAtPeriodEnd": subscription.cancel_at_period_end,
          "subscriptionDetails.currentPeriodEnd": new Date(subscription.current_period_end * 1000)
        });

        console.log("✅ Subscription updated for user:", userId);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata.userId;

        await updateDocument("user", { _id: userId }, {
          plan: "free",
          subscriptionStatus: "expired",
          stripeSubscriptionId: null,
          subscriptionDetails: null
        });

        console.log("❌ Subscription cancelled for user:", userId);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscription = invoice.subscription;

        await updateDocument("user", { stripeSubscriptionId: subscription }, {
          subscriptionStatus: "past_due"
        });

        console.log("⚠️ Payment failed for subscription:", subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    res.status(500).send("Webhook processing failed");
  }
};

export default stripeWebhook;