// ============================================
// VOICE CLONING APIs - POST /runtime/voices/enroll
// ============================================

import Joi from "joi";
import { findOne, insertNewDocument } from "../../helpers/index.js";
import axios from "axios";

const voiceEnrollSchema = Joi.object({
  sampleUrls: Joi.array().items(Joi.string()).required(),
  name: Joi.string().default('My Voice'),
  language: Joi.string().default('cs'),
});

const enrollVoice = async (req, res) => {
  try {
    const RUNTIME_API_URL = process.env.RUNTIME_API_URL || 'https://runtime-api.lunebi.com';
    await voiceEnrollSchema.validateAsync(req.body);
    const {id} = req.params
    const { sampleUrls, name = 'My Voice', language = 'cs' } = req.body;
    
    const findVoice = await findOne("user",{_id:id})
    if (findVoice.voiceId) {
      return res.status(400).send({
        status: 400,
        message: 'User already has a voice profile'
      });
    }
    
    const consent = await insertNewDocument("consent", {
   //   firebaseUid: req.firebaseUid,
    userId: id,
      consentKey: 'voice_clone#1.0',
      type: 'voice_clone',
      version: '1.0',
      jurisdiction: 'EU',
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    // is mein voice ai ke pass jati hain generator hone
    const response = await axios.post(`${RUNTIME_API_URL}/runtime/voices/enroll`, {
      userId: id,
      sampleUrls,
      name,
      language
    }, {
      headers: { 'Authorization': req.headers.authorization }
    });
    
    const voiceData = response?.data;
    
    const voiceProfile = await insertNewDocument("voiceProfile", {
      userId: id,
    //  firebaseUid: req.firebaseUid,
      voiceId: voiceData?.voiceId,
      name,
      status: 'training',
      sampleUrls
    });
    
      const addVoice = await insertNewDocument("user", {
      userId: id,
    //  firebaseUid: req.firebaseUid,
      voiceId: voiceData?.voiceId,
     
    });

    // req.user.voiceId = voiceData.voiceId;
    // await req.user.save();
    
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

export default enrollVoice ;