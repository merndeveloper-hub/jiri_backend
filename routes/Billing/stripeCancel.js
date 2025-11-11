
// ============================================
// GET /api/v1/billing/stripecancel
// ============================================
import { updateDocument } from "../../helpers/index.js";


const stripeCancel = async (req, res) => {
  try {
    const sessionId = req.query.session_id;
    
    if (!sessionId) {
      return res.status(400).send({
        status: 400,
        message: "Session ID is required"
      });
    }

    //  Update transaction status
    // await SubscriptionTransaction.findOneAndUpdate(
    //   { stripeSessionId: sessionId },
    //   { 
    //     status: "cancelled",
    //     metadata: {
    //       cancelledAt: new Date().toISOString()
    //     }
    //   }
    // );

    await updateDocument("subscriptionTransaction",{stripeSessionId: sessionId},{ 
        status: "cancelled",
        metadata: {
          cancelledAt: new Date().toISOString()
        }
      })

    console.log(" Payment cancelled for session:", sessionId);

    //  Redirect to cancel page
  //  return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscription/cancelled`);
return res.send("<html><body style='background:#fff;'></body></html>");
  } catch (error) {
    console.error(" Error handling cancellation:", error);
    return res.status(500).send({
      status: 500,
      message: error.message || "An unexpected error occurred."
    });
  }
};

export default stripeCancel;