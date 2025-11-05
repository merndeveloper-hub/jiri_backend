import axios from "axios";
import { findOne, insertNewDocument } from "../../helpers/index.js";

// GET /runtime/stories/:id/status - Check story generation status
const getGenerStory = async (req, res) => {
  try {
    const { id, storyId } = req.params
    const RUNTIME_API_URL = process.env.RUNTIME_API_URL || 'https://runtime-api.lunebi.com';
    const response = await axios.get(
      `${RUNTIME_API_URL}/runtime/stories/${storyId}/status`,
      { headers: { 'Authorization': req.headers.authorization } }
    );

    const statusData = response.data;

    // If completed, cache the audio
    if (statusData.status === 'completed' && statusData.audioUrl) {


      const story = await findOne("story", { storyId: storyId });

      await insertNewDocument("audioCache", {
        userId: id,
        storyId: storyId,
        voiceType: statusData.voiceType || 'preset',
        audioUrl: statusData.audioUrl,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isFavorited: req.user.favorites.includes(storyId)
      });
      //  await cache.save();
    }

    return res.json({ status: 200, statusData });
  } catch (error) {
    res.status(500).json({
      error: { code: 'STATUS_CHECK_ERROR', message: error.message }
    });
  }
}

export default getGenerStory;