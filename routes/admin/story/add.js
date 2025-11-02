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
  category: Joi.string().required(),
  ageGroup: Joi.string().required(),
  duration: Joi.string().required(),
  durationMin: Joi.number().required(),
  mood: Joi.string().optional(),
  isPro: Joi.boolean().default(false),
  thumbnailUrl: Joi.string().optional(),
  audioLinks: Joi.object().optional(),
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
        title: story.title
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