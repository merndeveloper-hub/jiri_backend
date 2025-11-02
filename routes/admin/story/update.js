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
  category: Joi.string().optional(),
  ageGroup: Joi.string().optional(),
  duration: Joi.string().optional(),
  durationMin: Joi.number().optional(),
  mood: Joi.string().optional(),
  isPro: Joi.boolean().optional(),
  thumbnailUrl: Joi.string().optional(),
  audioLinks: Joi.object().optional(),
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

  const story = await updateDocument("story",   { storyId: req.params.id },
      { ...req.body, updatedAt: Date.now() },);

  
    
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
        title: story.title
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