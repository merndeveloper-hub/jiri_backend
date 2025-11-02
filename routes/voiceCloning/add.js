// ============================================
// VOICE CLONING APIs - POST /runtime/voices/enroll
// ============================================

const voiceEnrollSchema = Joi.object({
  sampleUrls: Joi.array().items(Joi.string()).required(),
  name: Joi.string().default('My Voice'),
  language: Joi.string().default('cs'),
});

const enrollVoice = async (req, res) => {
  try {
    await voiceEnrollSchema.validateAsync(req.body);
    
    const { sampleUrls, name = 'My Voice', language = 'cs' } = req.body;
    
    if (req.user.voiceId) {
      return res.status(400).send({
        status: 400,
        message: 'User already has a voice profile'
      });
    }
    
    const consent = await insertNewDocument("consent", {
      firebaseUid: req.firebaseUid,
      consentKey: 'voice_clone#1.0',
      type: 'voice_clone',
      version: '1.0',
      jurisdiction: 'EU',
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    const response = await axios.post(`${RUNTIME_API_URL}/runtime/voices/enroll`, {
      userId: req.firebaseUid,
      sampleUrls,
      name,
      language
    }, {
      headers: { 'Authorization': req.headers.authorization }
    });
    
    const voiceData = response.data;
    
    const voiceProfile = await insertNewDocument("voiceProfile", {
      userId: req.user._id,
      firebaseUid: req.firebaseUid,
      voiceId: voiceData.voiceId,
      name,
      status: 'training',
      sampleUrls
    });
    
    req.user.voiceId = voiceData.voiceId;
    await req.user.save();
    
    return res.status(201).send({
      status: 201,
      voice: {
        id: voiceData.voiceId,
        name,
        status: 'training'
      },
      job: voiceData.job
    });
  } catch (error) {
    console.error("Error enrolling voice:", error);
    return res.status(400).send({ 
      status: 400, 
      message: error.message || "An unexpected error occurred."
    });
  }
};

export { enrollVoice };