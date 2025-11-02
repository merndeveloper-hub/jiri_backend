// ============================================
// STORY GENERATION APIs - POST /runtime/stories/prepare
// ============================================

const prepareStorySchema = Joi.object({
  storyId: Joi.string().required(),
  voiceType: Joi.string().valid('preset', 'cloned', 'default').default('preset'),
  voiceId: Joi.string().optional(),
});

const checkPlayLimit = async (user, voiceType) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  if (user.limits.month_key !== currentMonth) {
    user.limits.free_plays_used_month = 0;
    user.limits.cloned_plays_used_month = 0;
    user.limits.month_key = currentMonth;
    await user.save();
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
    
    const { storyId, voiceType = 'preset', voiceId } = req.body;
    const user = req.user;
    
    const limitCheck = await checkPlayLimit(user, voiceType);
    if (!limitCheck.allowed) {
      return res.status(403).send({
        status: 403,
        message: limitCheck.reason
      });
    }
    
    const cachedAudio = await AudioCache.findOne({
      userId: user._id,
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
      userId: req.firebaseUid,
      voiceType,
      voiceId: voiceType === 'cloned' ? voiceId : undefined
    }, {
      headers: { 'Authorization': req.headers.authorization }
    });
    
    const jobData = response.data;
    
    await insertNewDocument("play", {
      userId: user._id,
      firebaseUid: req.firebaseUid,
      storyId,
      voiceType,
      monthKey: new Date().toISOString().slice(0, 7)
    });
    
    if (voiceType === 'cloned') {
      user.limits.cloned_plays_used_month += 1;
    }
    await user.save();
    
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

export { prepareStory };