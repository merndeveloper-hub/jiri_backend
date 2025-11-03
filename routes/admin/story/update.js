// ============================================
// ADMIN APIs - PATCH /admin/stories/:id
// ============================================
import Joi from "joi";
import {
  findOne,
  insertNewDocument,
  findOneAndSelect,
  updateDocument,
  getAggregate,
  deleteDocument,
} from "../../../helpers/index.js";

const updateStorySchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  status: Joi.string().valid("DRAFT", "PUBLISHED", "ARCHIVED").optional(),
  is_mock: Joi.boolean().optional(),
  category: Joi.string().optional(),
  ageGroup: Joi.string().optional(),
  age_min: Joi.number().optional(),
  age_max: Joi.number().optional(),
  duration: Joi.string().optional(),
  duration_s: Joi.number().optional(),
  durationMin: Joi.number().optional(),
  mood: Joi.string().optional(),
  textContent: Joi.string().optional(),
  audioLinks: Joi.object({
    male: Joi.string().optional(),
    female: Joi.string().optional(),
  }).optional(),
  assets: Joi.object({
    final_m4a_url: Joi.string().optional(),
    text: Joi.string().optional(),
  }).optional(),
  languages: Joi.array().items(Joi.string()).optional(),
  isPro: Joi.boolean().optional(),
  tonightPic: Joi.boolean().optional(),
  thumbnailUrl: Joi.string().optional(),
  image_url: Joi.string().optional(),
  audio_url: Joi.string().optional(),
});

const updateStory = async (req, res) => {
  try {
    const { error } = updateStorySchema.validate(req.body);
    if (error) {
      return res.status(400).send({
        status: 400,
        message: error.details[0].message
      });
    }

    const story = await updateDocument(
      "story",
      { storyId: req.params.id },
      { ...req.body, updatedAt: Date.now() }
    );

    if (!story) {
      return res.status(404).send({
        status: 404,
        message: 'Story not found'
      });
    }
    
    return res.status(200).send({
      status: 200,
      message: 'Story updated',
      story: {
        id: story.storyId,
        title: story.title,
        status: story.status,
        is_mock: story.is_mock,
        isPro: story.isPro,
        tonightPic: story.tonightPic,
      }
    });
  } catch (error) {
    console.error("Error updating story:", error);
    return res.status(500).send({ 
      status: 500, 
      message: error.message || "An unexpected error occurred."
    });
  }
};

export default updateStory;