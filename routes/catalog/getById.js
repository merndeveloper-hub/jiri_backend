
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
        categories: story.categories,
        ageGroup: story.ageGroup,
        duration: story.duration,
        durationMin: story.durationMin,
        mood: story.mood,
        textContent: story.textContent,
        audioLinks: story.audioLinks,
        languages: story.languages,
        isPro: story.isPro,
        thumbnailUrl: story.thumbnailUrl
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

export default getStoryById ;
