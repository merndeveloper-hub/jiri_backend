// ============================================
// ADMIN APIs - POST /admin/stories
// ============================================

import {
  findOne,
  insertNewDocument,
  findOneAndSelect,
  updateDocument,
  getAggregate,
  deleteDocument,
} from "../../../helpers/index.js";
import Joi from "joi";

const createStorySchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  status: Joi.string().valid("DRAFT", "PUBLISHED", "ARCHIVED").default("DRAFT"),
  is_mock: Joi.boolean().default(false),
  category: Joi.string().required(),
  ageGroup: Joi.string().required(),
  age_min: Joi.number().optional(),
  age_max: Joi.number().optional(),
  duration: Joi.string().required(),
  duration_s: Joi.number().optional(),
  durationMin: Joi.number().required(),
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
  languages: Joi.array().items(Joi.string()).default(["cs"]),
  isPro: Joi.boolean().default(false),
  tonightPic: Joi.boolean().default(false),
  thumbnailUrl: Joi.string().optional(),
  image_url: Joi.string().optional(),
  audio_url: Joi.string().optional(),
});

const createStory = async (req, res) => {
  try {
    const { error } = createStorySchema.validate(req.body);
    if (error) {
      return res.status(400).send({
        status: 400,
        message: error.details[0].message
      });
    }

    const storyData = req.body;

    const story = await insertNewDocument("story", {
      ...storyData,
      storyId: `st_${Date.now()}`,
    });

    return res.status(201).send({
      status: 201,
      message: 'Story created',
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
    console.error("Error creating story:", error);
    return res.status(500).send({
      status: 500,
      message: error.message || "An unexpected error occurred."
    });
  }
};

export default createStory;