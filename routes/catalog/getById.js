// ============================================
// CATALOG APIs - GET /app/library/:id
// ============================================
import { findOneAndSelect } from "../../helpers/index.js";

const getStoryById = async (req, res) => {
  try {
    const story = await findOneAndSelect("story", { storyId: req.params.id });
    
    if (!story) {
      return res.status(404).send({ 
        status: 404, 
        message: "Story not found" 
      });
    }
    
    return res.status(200).send({
      status: 200,
      story: {
        id: story.storyId,
        title: story.title,
        description: story.description,
        status: story.status,
        is_mock: story.is_mock,
        categories: story.categories,
        ageGroup: story.ageGroup,
        age_min: story.age_min,
        age_max: story.age_max,
        duration: story.duration,
        duration_s: story.duration_s,
        durationMin: story.durationMin,
        mood: story.mood,
        textContent: story.textContent,
        audioLinks: story.audioLinks,
        assets: story.assets,
        languages: story.languages,
        isPro: story.isPro,
        tonightPic: story.tonightPic,
        thumbnailUrl: story.thumbnailUrl,
        image_url: story.image_url,
        audio_url: story.audio_url,
        createdAt: story.createdAt,
        updatedAt: story.updatedAt
      }
    });
  } catch (error) {
    console.error("Error fetching story:", error);
    return res.status(400).send({ 
      status: 400, 
      message: error.message || "An unexpected error occurred."
    });
  }
};

export default getStoryById;