// ============================================
// USER APIs - GET /app/me
// ============================================

import { findOne } from "../../helpers/index.js";

const getMe = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await findOne("user", { _id: id })

    const voiceProfile = await findOne("voiceProfile", { userId: id });

    return res.status(200).send({
      status: 200,
      id: user.firebaseUid,
      email: user.email,
      name: user.name,
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
      limits: user.limits,
      voice: voiceProfile ? {
        id: voiceProfile.voiceId,
        name: voiceProfile.name,
        status: voiceProfile.status
      } : null,
      favoritesCount: user.favorites.length,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    return res.status(500).send({
      status: 500,
      message: error.message || "An unexpected error occurred."
    });
  }
};

export default getMe;