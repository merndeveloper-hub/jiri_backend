import jwt from "jsonwebtoken";
import ACCESS_TOKEN_SECRET from "../../config/index.js";
import findOne from "../../helpers/index.js";

// Helper: Check Plan Limits
const checkPlayLimit = async (user, voiceType) => {
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  
  if (user.limits.month_key !== currentMonth) {
    user.limits.free_plays_used_month = 0;
    user.limits.cloned_plays_used_month = 0;
    user.limits.month_key = currentMonth;
    await user.save();
  }
  
  if (user.plan === 'free') {
    if (voiceType === 'cloned') {
      return { allowed: false, reason: 'Free plan does not support cloned voices' };
    }
    // Free plan: unlimited preset plays
    return { allowed: true };
  }
  
  if (user.plan === 'pro') {
    if (voiceType === 'cloned' && user.limits.cloned_plays_used_month >= 20) {
      return { allowed: false, reason: 'Monthly cloned voice limit reached (20/month)' };
    }
    return { allowed: true };
  }
  
  return { allowed: true };
};

export default checkPlayLimit;
