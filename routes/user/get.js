// ============================================
// USAGE APIs - GET /app/usage/:id
// ============================================
import Joi from "joi";
import { findOne, getAggregate } from "../../helpers/index.js";
import mongoose from "mongoose";

const usageSchema = Joi.object({
  // No body params needed for this endpoint
});

const getUsage = async (req, res) => {
  try {
    const id = req.params.id;
    const currentMonth = new Date().toISOString().slice(0, 7);

    //  Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        status: 400,
        message: "Invalid user ID format"
      });
    }

    //  Get user details
    const user = await findOne("user", { _id: id });

    if (!user) {
      return res.status(404).send({
        status: 404,
        message: "User not found"
      });
    }

    //  Reset monthly limits if new month
    if (user.limits.month_key !== currentMonth) {
      user.limits.free_plays_used_month = 0;
      user.limits.cloned_plays_used_month = 0;
      user.limits.month_key = currentMonth;
      
      // Update in database
      await updateDocument("user", { _id: id }, {
        "limits.free_plays_used_month": 0,
        "limits.cloned_plays_used_month": 0,
        "limits.month_key": currentMonth
      });
    }

    //  Aggregate plays by voice type for current month
    const plays = await getAggregate("play", [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(id),
          monthKey: currentMonth
        }
      },
      {
        $group: {
          _id: "$voiceType",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          voiceType: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    //  Format plays by type
    const playsByType = {};
    plays.forEach(p => {
      playsByType[p.voiceType] = p.count;
    });

    //  Define plan-based limits
    const planLimits = {
      free: {
        clonedPlaysLimit: 0,
        freePlaysLimit: 10
      },
      pro: {
        clonedPlaysLimit: 20,
        freePlaysLimit: 50
      },
      family: {
        clonedPlaysLimit: 30,
        freePlaysLimit: 100
      }
    };

    const currentPlanLimits = planLimits[user.plan] || planLimits.free;

    //  Calculate totals
    const presetPlays = playsByType.preset || 0;
    const clonedPlays = playsByType.cloned || 0;
    const totalPlays = presetPlays + clonedPlays;

    return res.status(200).send({
      status: 200,
      month: currentMonth,
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
      plays: {
        preset: presetPlays,
        cloned: clonedPlays,
        total: totalPlays
      },
      limits: {
        // Free plays
        freePlaysLimit: currentPlanLimits.freePlaysLimit,
        freePlaysUsed: user.limits.free_plays_used_month,
        freePlaysRemaining: Math.max(
          0,
          currentPlanLimits.freePlaysLimit - user.limits.free_plays_used_month
        ),
        
        // Cloned plays
        clonedPlaysLimit: currentPlanLimits.clonedPlaysLimit,
        clonedPlaysUsed: user.limits.cloned_plays_used_month,
        clonedPlaysRemaining: Math.max(
          0,
          currentPlanLimits.clonedPlaysLimit - user.limits.cloned_plays_used_month
        )
      },
      features: {
        canUsePresetVoice: true,
        canUseClonedVoice: user.plan === "pro" || user.plan === "family",
        hasActiveSubscription: user.subscriptionStatus === "active" || 
                               user.subscriptionStatus === "trialing"
      }
    });

  } catch (error) {
    console.error("❌ Error fetching usage:", error);
    return res.status(500).send({
      status: 500,
      message: error.message || "An unexpected error occurred."
    });
  }
};

export default getUsage;