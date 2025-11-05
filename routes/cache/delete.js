// ============================================
// AUDIO CACHE APIs - DELETE /app/audio/cache
// ============================================

import { deleteManyDocument } from "../../helpers/index.js";


const clearCache = async (req, res) => {
  try {

    const {id} = req.params
    const result = await deleteManyDocument("audioCache",{
      userId: id,
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