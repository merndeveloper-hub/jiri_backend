// ============================================
// AUDIO CACHE APIs - DELETE /app/audio/cache
// ============================================
import Joi from "joi";

const clearCache = async (req, res) => {
  try {
    const result = await AudioCache.deleteMany({
      userId: req.user._id,
      isFavorited: false,
      expiresAt: { $lt: new Date() }
    });
    
    return res.status(200).send({
      status: 200,
      message: 'Cache cleared',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
    return res.status(500).send({ 
      status: 500, 
      message: error.message || "An unexpected error occurred."
    });
  }
};

export default clearCache;