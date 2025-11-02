// ============================================
// AUDIO CACHE APIs - GET /app/audio/cache/:storyId
// ============================================
import Joi from "joi";

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

    const { voiceType = 'preset' } = req.query;
    
    const cache = await AudioCache.findOne({
      userId: req.user._id,
      storyId: req.params.storyId,
      voiceType,
      expiresAt: { $gt: new Date() }
    });
    
    if (!cache) {
      return res.status(404).send({
        status: 404,
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