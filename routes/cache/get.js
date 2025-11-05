// ============================================
// AUDIO CACHE APIs - GET /app/audio/cache/:storyId
// ============================================
import Joi from "joi";
import { findOne } from "../../helpers/index.js";

const cacheQuerySchema = Joi.object({
  voiceType: Joi.string().default('preset'),
});

const getCachedAudio = async (req, res) => {
  try {
    const { error } = cacheQuerySchema.validate(req.query);
    if (error) {
      return res.status(400).send({
        status: 400,
        message: error.details[0].message
      });
    }
    const { userId, storyId } = req.params
    const { voiceType = 'preset' } = req.query;

    const cache = await findOne("audioCache", {
      userId: userId,
      storyId: storyId,
      voiceType,
      expiresAt: { $gt: new Date() }
    });

    if (!cache) {
      return res.status(400).send({
        status: 400,
        message: 'No cached audio found'
      });
    }

    return res.status(200).send({
      status: 200,
      audioUrl: cache.audioUrl,
      expiresAt: cache.expiresAt,
      isFavorited: cache.isFavorited
    });
  } catch (error) {
    console.error("Error fetching cached audio:", error);
    return res.status(500).send({
      status: 500,
      message: error.message || "An unexpected error occurred."
    });
  }
};

export default getCachedAudio;