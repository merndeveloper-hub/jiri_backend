// ============================================
// ADMIN APIs - GET /admin/stats
// ============================================
import Joi from "joi";

const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const proUsers = await User.countDocuments({ plan: 'pro' });
    const totalStories = await Story.countDocuments();
    const totalPlays = await Play.countDocuments();
    const voicesCreated = await VoiceProfile.countDocuments({ status: 'ready' });
    
    return res.status(200).send({
      status: 200,
      users: {
        total: totalUsers,
        free: totalUsers - proUsers,
        pro: proUsers
      },
      stories: totalStories,
      plays: totalPlays,
      voices: voicesCreated
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return res.status(500).send({ 
      status: 500, 
      message: error.message || "An unexpected error occurred."
    });
  }
};

export default getStats;