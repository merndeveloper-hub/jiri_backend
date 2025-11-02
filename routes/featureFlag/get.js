// ============================================
// FEATURE FLAGS APIs - GET /app/feature-flags
// ============================================
import Joi from "joi";

const getFeatureFlags = async (req, res) => {
  try {
    return res.status(200).send({
      status: 200,
      flags: {
        voice_cloning: true,
        family_sharing: false,
        offline_mode: true,
        analytics: true
      }
    });
  } catch (error) {
    console.error("Error fetching feature flags:", error);
    return res.status(500).send({ 
      status: 500, 
      message: error.message || "An unexpected error occurred."
    });
  }
};

export default getFeatureFlags;