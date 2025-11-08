// ============================================
// STORY GENERATION APIs - POST /runtime/stories/prepare
// ============================================

import axios from "axios";
import { findOne, insertNewDocument } from "../../helpers/index.js";
import Joi from "joi";

const prepareStorySchema = Joi.object({
  storyId: Joi.string().required(),
  voiceType: Joi.string().valid('preset', 'cloned', 'default').default('preset'),
  voiceId: Joi.string().optional(),
});
const RUNTIME_API_URL = process.env.RUNTIME_API_URL || 'https://runtime-api.lunebi.com';
const checkPlayLimit = async (id, voiceType) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  let user = await findOne("user", { _id: id })
  if (user.limits.month_key !== currentMonth) {
    user.limits.free_plays_used_month = 0;
    user.limits.cloned_plays_used_month = 0;
    user.limits.month_key = currentMonth;

    limits = {
      month_key: currentMonth,
      free_plays_used_month: 0,
      cloned_plays_used_month: 0
    }
    await insertNewDocument("user", {
      limits
    });

    //await user.save();
  }

  if (user.plan === 'free') {
    if (voiceType === 'cloned') {
      return { allowed: false, reason: 'Free plan does not support cloned voices' };
    }
    return { allowed: true };
  }

  if (user.plan === 'pro') {
    if (voiceType === 'cloned' && user.limits.cloned_plays_used_month >= 20) {
      return { allowed: false, reason: 'Monthly cloned voice limit reached (20/month)' };
    }
    return { allowed: true };
  }

  return { allowed: true };
};

const prepareStory = async (req, res) => {
  try {
    await prepareStorySchema.validateAsync(req.body);
    const { id } = req.params

    const { storyId, voiceType = 'preset', voiceId } = req.body;
    const user = id;

    const limitCheck = await checkPlayLimit(user, voiceType);
    if (!limitCheck.allowed) {
      return res.status(400).send({
        status: 400,
        message: limitCheck.reason
      });
    }

    const cachedAudio = await findOne("audioCache", {
      userId: id,
      storyId,
      voiceType,
      expiresAt: { $gt: new Date() }
    });

    if (cachedAudio) {
      return res.status(200).send({
        status: 200,
        story: {
          status: 'ready',
          audioUrl: cachedAudio.audioUrl,
          cached: true
        }
      });
    }

    const response = await axios.post(`${RUNTIME_API_URL}/runtime/stories/prepare`, {
      storyId,
      userId: id,
      voiceType,
      voiceId: voiceType === 'cloned' ? voiceId : undefined
    }, {
      headers: { 'Authorization': req.headers.authorization }
    });

    const jobData = response.data;

    await insertNewDocument("play", {
      userId: id,
      // firebaseUid: req.firebaseUid,
      storyId,
      voiceType,
      monthKey: new Date().toISOString().slice(0, 7)
    });

    if (voiceType === 'cloned') {
      user.limits.cloned_plays_used_month += 1;
    }
    let findUser = await findOne("user", { _id: id })

    limits = {
      cloned_plays_used_month: findUser?.cloned_plays_used_month + 1
    }
    await insertNewDocument("user", {
      limits
    });
    // await user.save();

    return res.status(200).send({
      status: 200,
      job: {
        jobId: jobData.jobId,
        status: 'processing',
        etaSeconds: jobData.etaSeconds
      }
    });
  } catch (error) {
    console.error("Error preparing story:", error);
    return res.status(400).send({
      status: 400,
      message: error.message || "An unexpected error occurred."
    });
  }
};

export default prepareStory;

// const OpenAI = require('openai');

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });

// app.post('/api/generate-story', async (req, res) => {
//   const { childName, favouriteAnimal, storyTheme } = req.body;
  
//   const completion = await openai.chat.completions.create({
//     model: "gpt-4",
//     messages: [{
//       role: "user",
//       content: `Write a bedtime story for ${childName} about ${favouriteAnimal} with theme: ${storyTheme}`
//     }]
//   });

//   res.json({
//     success: true,
//     story: {
//       content: completion.choices[0].message.content
//     }
//   });
// });