// ============================================
// VOICE UPLOAD API - POST /api/voices/:id/upload
// ============================================

import Joi from "joi";
import { findOne, insertNewDocument, updateDocument } from "../../helpers/index.js";
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
// Multer Configuration (Single File)
// ============================================
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/m4a", "audio/mp4", "audio/webm"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only audio files are allowed."));
    }
  },
}).single("audio"); // Single file with field name "audio"

// ============================================
// Upload Single File to S3
// ============================================
const uploadToS3 = async (file, userId) => {
  const fileExtension = path.extname(file.originalname);
  const fileName = `voice-samples/${userId}/${uuidv4()}${fileExtension}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
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
const voiceUploadSchema = Joi.object({
  name: Joi.string().default("My Voice"),
  language: Joi.string().default("cs"),
});

// ============================================
// Main API: Upload Single Audio to S3
// POST /api/voices/:id/upload
// ============================================
const uploadVoice = async (req, res) => {
  try {
    // Validate body
    await voiceUploadSchema.validateAsync(req.body);
    
    const { id } = req.params;
    const { name = "My Voice", language = "cs" } = req.body;

    // Check if audio file exists
    if (!req.file) {
      return res.status(400).send({
        status: 400,
        message: "No audio file provided. Please upload an audio file.",
      });
    }

    // Check if user exists
    const findUser = await findOne("user", { _id: id });
    if (!findUser) {
      return res.status(404).send({
        status: 404,
        message: "User not found",
      });
    }
  // Check if user already has a voice
    if (findUser.voiceProfileId[0]) {
      return res.status(400).json({
        error: { code: 'VOICE_EXISTS', message: 'User already has a voice profile' }
      });
    }
    // Upload single file to S3
    const audioUrl = await uploadToS3(req.file, id);

    // Create voice profile record
    const voiceProfile = await insertNewDocument("voiceProfile", {
      userId: id,
      name,
      language,
      status: "uploaded",
      audioUrl,
      uploadedAt: new Date(),
    });

    // Update user with voice profile info
  await updateDocument("user", { _id: id }, {
  $set: { hasVoiceProfile: true },
  $addToSet: { voiceProfileId: voiceProfile._id }
});


    return res.status(201).send({
      status: 201,
      message: "Voice uploaded successfully",
      voice: {
        id: voiceProfile._id,
        name,
        language,
        status: "uploaded",
      },
      audioUrl,
      uploadedAt: new Date(),
    });
  } catch (error) {
    console.error("Error uploading voice:", error);
    
    // Handle Joi validation errors
    if (error.isJoi) {
      return res.status(400).send({
        status: 400,
        message: error.details[0].message,
      });
    }

    return res.status(500).send({
      status: 500,
      message: error.message || "An unexpected error occurred.",
    });
  }
};

// ============================================
// Export
// ============================================
export { uploadVoice, upload };