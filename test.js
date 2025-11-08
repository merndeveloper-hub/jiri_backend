// ============================================
// VOICE CLONING APIs - POST /runtime/voices/enroll
// ============================================

import Joi from "joi";
import { findOne, insertNewDocument, updateDocument } from "../../helpers/index.js";
import axios from "axios";
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import path from "path";

// ============================================
// AWS S3 Configuration
// ============================================
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "lunebi-voice-samples";

// ============================================
// Multer Configuration (Memory Storage)
// ============================================
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/m4a", "audio/mp4"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only audio files are allowed."));
    }
  },
});

// ============================================
// Upload File to S3
// ============================================
const uploadToS3 = async (file, userId) => {
  const fileExtension = path.extname(file.originalname);
  const fileName = `voice-samples/${userId}/${uuidv4()}${fileExtension}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    // ACL: "public-read", // Agar public chahiye (not recommended)
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // Return the S3 URL
    const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    return fileUrl;
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw new Error("Failed to upload file to S3");
  }
};

// ============================================
// Validation Schema
// ============================================
const voiceEnrollSchema = Joi.object({
  name: Joi.string().default("My Voice"),
  language: Joi.string().default("cs"),
});

// ============================================
// API 1: Upload Voice Samples to S3
// POST /api/voices/:id/upload-samples
// ============================================
const uploadVoiceSamples = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if files exist
    if (!req.files || req.files.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "No audio files provided. Please upload at least one sample.",
      });
    }

    // Check user exists
    const findUser = await findOne("user", { _id: id });
    if (!findUser) {
      return res.status(404).send({
        status: 404,
        message: "User not found",
      });
    }

    // Upload all files to S3
    const uploadPromises = req.files.map((file) => uploadToS3(file, id));
    const sampleUrls = await Promise.all(uploadPromises);

    return res.status(200).send({
      status: 200,
      message: "Voice samples uploaded successfully",
      sampleUrls,
      count: sampleUrls.length,
    });
  } catch (error) {
    console.error("Error uploading voice samples:", error);
    return res.status(500).send({
      status: 500,
      message: error.message || "Failed to upload voice samples",
    });
  }
};

// ============================================
// API 2: Enroll Voice with Uploaded URLs
// POST /api/voices/:id/enroll
// ============================================
const enrollVoice = async (req, res) => {
  try {
    const RUNTIME_API_URL = process.env.RUNTIME_API_URL || "https://runtime-api.lunebi.com";
    
    await voiceEnrollSchema.validateAsync(req.body);
    
    const { id } = req.params;
    const { sampleUrls, name = "My Voice", language = "cs" } = req.body;

    // Validate sampleUrls
    if (!sampleUrls || !Array.isArray(sampleUrls) || sampleUrls.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "sampleUrls array is required and must contain at least one URL",
      });
    }

    // Check if user exists
    const findVoice = await findOne("user", { _id: id });
    if (!findVoice) {
      return res.status(404).send({
        status: 404,
        message: "User not found",
      });
    }

    if (findVoice.voiceId) {
      return res.status(400).send({
        status: 400,
        message: "User already has a voice profile",
      });
    }

    // Create consent record
    const consent = await insertNewDocument("consent", {
      userId: id,
      consentKey: "voice_clone#1.0",
      type: "voice_clone",
      version: "1.0",
      jurisdiction: "EU",
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    // Send to voice AI for training
    const response = await axios.post(
      `${RUNTIME_API_URL}/runtime/voices/enroll`,
      {
        userId: id,
        sampleUrls,
        name,
        language,
      },
      {
        headers: { Authorization: req.headers.authorization },
      }
    );

    const voiceData = response?.data;

    // Create voice profile
    const voiceProfile = await insertNewDocument("voiceProfile", {
      userId: id,
      voiceId: voiceData?.voiceId,
      name,
      status: "training",
      sampleUrls,
    });

    // Update user with voiceId
    await updateDocument("user", { _id: id }, { voiceId: voiceData?.voiceId });

    return res.status(201).send({
      status: 201,
      message: "Voice enrolled successfully",
      voice: {
        id: voiceData.voiceId,
        name,
        status: "training",
      },
      job: voiceData.job,
    });
  } catch (error) {
    console.error("Error enrolling voice:", error);
    return res.status(400).send({
      status: 400,
      message: error.message || "An unexpected error occurred.",
    });
  }
};

// ============================================
// API 3: Combined Upload + Enroll
// POST /api/voices/:id/upload-and-enroll
// ============================================
const uploadAndEnrollVoice = async (req, res) => {
  try {
    const RUNTIME_API_URL = process.env.RUNTIME_API_URL || "https://runtime-api.lunebi.com";
    const { id } = req.params;
    const { name = "My Voice", language = "cs" } = req.body;

    // Check if files exist
    if (!req.files || req.files.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "No audio files provided",
      });
    }

    // Check user
    const findUser = await findOne("user", { _id: id });
    if (!findUser) {
      return res.status(404).send({
        status: 404,
        message: "User not found",
      });
    }

    if (findUser.voiceId) {
      return res.status(400).send({
        status: 400,
        message: "User already has a voice profile",
      });
    }

    // Upload files to S3
    const uploadPromises = req.files.map((file) => uploadToS3(file, id));
    const sampleUrls = await Promise.all(uploadPromises);

    // Create consent
    await insertNewDocument("consent", {
      userId: id,
      consentKey: "voice_clone#1.0",
      type: "voice_clone",
      version: "1.0",
      jurisdiction: "EU",
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    // Send to voice AI
    const response = await axios.post(
      `${RUNTIME_API_URL}/runtime/voices/enroll`,
      {
        userId: id,
        sampleUrls,
        name,
        language,
      },
      {
        headers: { Authorization: req.headers.authorization },
      }
    );

    const voiceData = response?.data;

    // Create voice profile
    await insertNewDocument("voiceProfile", {
      userId: id,
      voiceId: voiceData?.voiceId,
      name,
      status: "training",
      sampleUrls,
    });

    // Update user
    await updateDocument("user", { _id: id }, { voiceId: voiceData?.voiceId });

    return res.status(201).send({
      status: 201,
      message: "Voice samples uploaded and enrolled successfully",
      voice: {
        id: voiceData.voiceId,
        name,
        status: "training",
      },
      sampleUrls,
      job: voiceData.job,
    });
  } catch (error) {
    console.error("Error in upload and enroll:", error);
    return res.status(500).send({
      status: 500,
      message: error.message || "Failed to upload and enroll voice",
    });
  }
};

// ============================================
// Export with Multer Middleware
// ============================================
export { 
  enrollVoice, 
  uploadVoiceSamples, 
  uploadAndEnrollVoice,
  upload 
};