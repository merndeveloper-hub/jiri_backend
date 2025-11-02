// ============================================
// PLAN & BILLING APIs - GET /app/me/plan
// ============================================
import { findOne } from "../../helpers/index.js";

const getUserPlan = async (req, res) => {
  try {
    const id = req.params.id;
    
    // ✅ User find karein
    const user = await findOne("user", { _id: id });
    
    // ✅ User not found check
    if (!user) {
      return res.status(404).send({
        status: 404,
        message: "User not found"
      });
    }
    
    // ✅ Current month key (format: "2025-11")
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // ✅ Agar naya mahina hai to limits reset karein
    if (user.limits.month_key !== currentMonth) {
      user.limits.free_plays_used_month = 0;
      user.limits.cloned_plays_used_month = 0;
      user.limits.month_key = currentMonth;
      await user.save();
    }
    
    // ✅ Plan-based limits define karein
    const planLimits = {
      free: { cloned_plays_limit: 0, free_plays_limit: 10 },
      pro: { cloned_plays_limit: 20, free_plays_limit: 50 },
      family: { cloned_plays_limit: 30, free_plays_limit: 100 }
    };
    
    const currentPlanLimits = planLimits[user.plan] || planLimits.free;
    
    // ✅ Response return karein
    return res.status(200).send({
      status: 200,
      plan: {
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus,
        stripeCustomerId: user.stripeCustomerId || null,
        stripeSubscriptionId: user.stripeSubscriptionId || null,
        limits: {
          free_plays_used_month: user.limits.free_plays_used_month,
          free_plays_limit: currentPlanLimits.free_plays_limit,
          cloned_plays_used_month: user.limits.cloned_plays_used_month,
          cloned_plays_limit: currentPlanLimits.cloned_plays_limit,
          month_key: user.limits.month_key
        },
        voiceId: user.voiceId || null,
        features: {
          presetVoice: true, // ✅ Sabko available
          clonedVoice: user.plan === 'pro' || user.plan === 'family',
          voiceUploads: user.plan === 'free' ? 1 : 3, // ✅ Pro/Family ko zyada
          adFree: user.plan !== 'free' // ✅ Paid users ko ads nahi
        }
      }
    });
    
  } catch (error) {
    console.error("❌ Error fetching user plan:", error);
    return res.status(500).send({ 
      status: 500, 
      message: error.message || "An unexpected error occurred."
    });
  }
};

export default getUserPlan;