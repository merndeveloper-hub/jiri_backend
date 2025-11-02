// ============================================
// COMPLETE LUNEBI API STRUCTURE
// Node.js + Express + MongoDB
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const AWS = require('aws-sdk');

const app = express();
app.use(express.json());

// ============================================
// MONGODB SCHEMAS
// ============================================

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  plan: { type: String, enum: ['free', 'premium', 'family'], default: 'free' },
  language: { type: String, default: 'cs' },
  usage: {
    stories_generated_month: { type: Number, default: 0 },
    stories_limit_month: { type: Number, default: 3 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Voice Schema
const voiceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  language: { type: String, default: 'cs' },
  status: { type: String, enum: ['training', 'ready', 'failed'], default: 'training' },
  sampleUrls: [String],
  modelUrl: String, // AWS S3 URL for trained model
  createdAt: { type: Date, default: Date.now }
});

// Story Schema
const storySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  templateId: String, // For catalog stories
  language: { type: String, default: 'cs' },
  category: String,
  content: String, // Story text
  voiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Voice' },
  audioUrl: String, // S3 signed URL for MP3
  hlsUrl: String, // CloudFront HLS playlist URL
  downloadUrl: String,
  waveform: [Number],
  durationSec: Number,
  status: { type: String, enum: ['draft', 'generating', 'ready', 'failed'], default: 'draft' },
  isFavorite: { type: Boolean, default: false },
  progress: { positionSec: { type: Number, default: 0 }, completedAt: Date },
  createdAt: { type: Date, default: Date.now }
});

// Job Schema (for async tasks)
const jobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['voice_train', 'tts_generate', 'hls_prepare'] },
  status: { type: String, enum: ['queued', 'processing', 'completed', 'failed'], default: 'queued' },
  resourceId: String, // voice_id or story_id
  etaSeconds: Number,
  error: String,
  createdAt: { type: Date, default: Date.now },
  completedAt: Date
});

// Story Template (Catalog)
const templateSchema = new mongoose.Schema({
  templateId: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  lang: { type: String, default: 'cs' },
  category: String,
  summary: String,
  estimatedDurationMin: Number,
  age: String,
  tags: [String],
  variables: [{
    key: String,
    label: String,
    type: String,
    required: Boolean
  }]
});

// Consent Schema
const consentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  version: String,
  acceptedAt: { type: Date, default: Date.now },
  jurisdiction: String
});

// Family Schema
const familySchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['parent', 'child'], default: 'parent' },
    addedAt: { type: Date, default: Date.now }
  }],
  plan: String
});

const User = mongoose.model('User', userSchema);
const Voice = mongoose.model('Voice', voiceSchema);
const Story = mongoose.model('Story', storySchema);
const Job = mongoose.model('Job', jobSchema);
const Template = mongoose.model('Template', templateSchema);
const Consent = mongoose.model('Consent', consentSchema);
const Family = mongoose.model('Family', familySchema);

// ============================================
// MIDDLEWARE
// ============================================

// JWT Authentication Middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: { code: 'UNAUTHORIZED', message: 'Missing or invalid token' } 
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ 
      error: { code: 'INVALID_TOKEN', message: 'Token expired or invalid' } 
    });
  }
};

// Rate Limiting Middleware (simple in-memory)
const rateLimits = new Map();
const rateLimit = (limit = 100, windowMs = 3600000) => {
  return (req, res, next) => {
    const key = req.userId || req.ip;
    const now = Date.now();
    const userLimit = rateLimits.get(key) || { count: 0, resetTime: now + windowMs };
    
    if (now > userLimit.resetTime) {
      userLimit.count = 0;
      userLimit.resetTime = now + windowMs;
    }
    
    userLimit.count++;
    rateLimits.set(key, userLimit);
    
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - userLimit.count));
    res.setHeader('X-RateLimit-Reset', Math.floor(userLimit.resetTime / 1000));
    
    if (userLimit.count > limit) {
      res.setHeader('Retry-After', Math.ceil((userLimit.resetTime - now) / 1000));
      return res.status(429).json({ 
        error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' } 
      });
    }
    
    next();
  };
};

// ============================================
// 1) VOICES APIs (AWS Freelancer)
// ============================================

// POST /voices - Upload voice samples
const upload = multer({ dest: 'uploads/' });

app.post('/voices', authenticateJWT, upload.single('audio'), async (req, res) => {
  try {
    const { name, language = 'cs', consent } = req.body;
    
    if (consent !== 'true') {
      return res.status(400).json({ 
        error: { code: 'CONSENT_REQUIRED', message: 'Voice cloning consent required' } 
      });
    }
    
    // Upload to S3 (AWS Freelancer implements)
    const s3Url = `https://s3.amazonaws.com/lunebi-voices/${req.userId}/${Date.now()}.wav`;
    
    const voice = new Voice({
      userId: req.userId,
      name,
      language,
      status: 'training',
      sampleUrls: [s3Url]
    });
    
    await voice.save();
    
    // Create training job
    const job = new Job({
      userId: req.userId,
      type: 'voice_train',
      resourceId: voice._id.toString(),
      status: 'queued',
      etaSeconds: 180
    });
    
    await job.save();
    
    res.status(201).json({
      voice: {
        id: voice._id,
        name: voice.name,
        language: voice.language,
        status: voice.status
      },
      job: {
        id: job._id,
        type: job.type,
        status: job.status,
        etaSeconds: job.etaSeconds
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: error.message } 
    });
  }
});

// GET /voices - List all voices
app.get('/voices', authenticateJWT, async (req, res) => {
  try {
    const voices = await Voice.find({ userId: req.userId });
    
    res.json({
      voices: voices.map(v => ({
        id: v._id,
        name: v.name,
        language: v.language,
        status: v.status
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: error.message } 
    });
  }
});

// GET /voices/:id - Get specific voice
app.get('/voices/:id', authenticateJWT, async (req, res) => {
  try {
    const voice = await Voice.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!voice) {
      return res.status(404).json({ 
        error: { code: 'VOICE_NOT_FOUND', message: 'Voice not found' } 
      });
    }
    
    res.json({
      id: voice._id,
      name: voice.name,
      language: voice.language,
      status: voice.status
    });
  } catch (error) {
    res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: error.message } 
    });
  }
});

// DELETE /voices/:id
app.delete('/voices/:id', authenticateJWT, async (req, res) => {
  try {
    const result = await Voice.deleteOne({ _id: req.params.id, userId: req.userId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        error: { code: 'VOICE_NOT_FOUND', message: 'Voice not found' } 
      });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: error.message } 
    });
  }
});

// ============================================
// 2) AUTH APIs (Full-Stack Developer)
// ============================================

// POST /auth/login
app.post('/auth/login', async (req, res) => {
  try {
    const { provider, token } = req.body;
    
    // Verify magic link token (implement your logic)
    // For demo, we'll create/find user
    
    let user = await User.findOne({ email: 'parent@example.com' });
    
    if (!user) {
      user = new User({
        email: 'parent@example.com',
        name: 'Jana',
        plan: 'free',
        language: 'cs'
      });
      await user.save();
    }
    
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        language: user.language
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: error.message } 
    });
  }
});

// GET /me
app.get('/me', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const voices = await Voice.find({ userId: req.userId, status: 'ready' });
    
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      usage: user.usage,
      voices: voices.map(v => ({ id: v._id, name: v.name, status: v.status })),
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: error.message } 
    });
  }
});

// PATCH /me - Update user settings
app.patch('/me', authenticateJWT, async (req, res) => {
  try {
    const { name, language } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, language, updatedAt: Date.now() },
      { new: true }
    );
    
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      language: user.language
    });
  } catch (error) {
    res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: error.message } 
    });
  }
});

// ============================================
// 3) STORY CATALOG APIs (Full-Stack Developer)
// ============================================

// GET /catalog/stories
app.get('/catalog/stories', async (req, res) => {
  try {
    const { lang = 'cs', category, page = 1, pageSize = 20 } = req.query;
    
    const query = { lang };
    if (category) query.category = category;
    
    const total = await Template.countDocuments(query);
    const templates = await Template.find(query)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));
    
    res.json({
      items: templates.map(t => ({
        id: t.templateId,
        title: t.title,
        lang: t.lang,
        category: t.category,
        durationMin: t.estimatedDurationMin,
        age: t.age,
        tags: t.tags
      })),
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      total
    });
  } catch (error) {
    res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: error.message } 
    });
  }
});

// GET /catalog/stories/:id
app.get('/catalog/stories/:id', async (req, res) => {
  try {
    const template = await Template.findOne({ templateId: req.params.id });
    
    if (!template) {
      return res.status(404).json({ 
        error: { code: 'TEMPLATE_NOT_FOUND', message: 'Story template not found' } 
      });
    }
    
    res.json({
      id: template.templateId,
      title: template.title,
      lang: template.lang,
      category: template.category,
      summary: template.summary,
      estimatedDurationMin: template.estimatedDurationMin,
      variables: template.variables
    });
  } catch (error) {
    res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: error.message } 
    });
  }
});

// ============================================
// 4) STORIES APIs (Full-Stack + AWS)
// ============================================

// POST /stories - Create new story
app.post('/stories', authenticateJWT, rateLimit(10), async (req, res) => {
  try {
    const { title, content, voiceId, templateId, language = 'cs' } = req.body;
    
    const story = new Story({
      userId: req.userId,
      title,
      content,
      voiceId,
      templateId,
      language,
      status: 'generating'
    });
    
    await story.save();
    
    // Create TTS job (AWS freelancer handles)
    const job = new Job({
      userId: req.userId,
      type: 'tts_generate',
      resourceId: story._id.toString(),
      status: 'queued',
      etaSeconds: 120
    });
    
    await job.save();
    
    res.status(201).json({
      story: {
        id: story._id,
        title: story.title,
        status: story.status
      },
      job: {
        id: job._id,
        type: job.type,
        status: job.status
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: error.message } 
    });
  }
});

// GET /stories - List user's stories
app.get('/stories', authenticateJWT, async (req, res) => {
  try {
    const stories = await Story.find({ userId: req.userId }).sort('-createdAt');
    
    res.json({
      stories: stories.map(s => ({
        id: s._id,
        title: s.title,
        status: s.status,
        audioUrl: s.audioUrl,
        hlsUrl: s.hlsUrl,
        isFavorite: s.isFavorite,
        createdAt: s.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: error.message } 
    });
  }
});

// PATCH /stories/:id/progress
app.patch('/stories/:id/progress', authenticateJWT, async (req, res) => {
  try {
    const { positionSec } = req.body;
    
    const story = await Story.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { 'progress.positionSec': positionSec },
      { new: true }
    );
    
    if (!story) {
      return res.status(404).json({ 
        error: { code: 'STORY_NOT_FOUND', message: 'Story not found' } 
      });
    }
    
    res.json({ progress: story.progress });
  } catch (error) {
    res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: error.message } 
    });
  }
});

// POST /stories/:id/favorite
app.post('/stories/:id/favorite', authenticateJWT, async (req, res) => {
  try {
    const story = await Story.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isFavorite: true },
      { new: true }
    );
    
    if (!story) {
      return res.status(404).json({ 
        error: { code: 'STORY_NOT_FOUND', message: 'Story not found' } 
      });
    }
    
    res.json({ isFavorite: story.isFavorite });
  } catch (error) {
    res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: error.message } 
    });
  }
});

// ============================================
// 5) JOBS APIs (AWS Freelancer)
// ============================================

// GET /jobs/:id
app.get('/jobs/:id', authenticateJWT, async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!job) {
      return res.status(404).json({ 
        error: { code: 'JOB_NOT_FOUND', message: 'Job not found' } 
      });
    }
    
    res.json({
      id: job._id,
      type: job.type,
      status: job.status,
      resourceId: job.resourceId,
      createdAt: job.createdAt,
      completedAt: job.completedAt
    });
  } catch (error) {
    res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: error.message } 
    });
  }
});

// ============================================
// 6) FAMILY SHARING (Full-Stack Developer)
// ============================================

// POST /family/invite
app.post('/family/invite', authenticateJWT, async (req, res) => {
  try {
    const { email, role = 'parent' } = req.body;
    
    let family = await Family.findOne({ ownerId: req.userId });
    
    if (!family) {
      family = new Family({ ownerId: req.userId, members: [] });
    }
    
    // Find or create invited user
    let invitedUser = await User.findOne({ email });
    if (!invitedUser) {
      invitedUser = new User({ email, plan: 'family' });
      await invitedUser.save();
    }
    
    family.members.push({ userId: invitedUser._id, role });
    await family.save();
    
    res.status(201).json({ 
      message: 'Invitation sent',
      member: { userId: invitedUser._id, email, role }
    });
  } catch (error) {
    res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: error.message } 
    });
  }
});

// ============================================
// 7) HEALTH & UTILITIES (Full-Stack Developer)
// ============================================

// GET /health
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ============================================
// DATABASE CONNECTION & SERVER START
// ============================================

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lunebi';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected');
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

module.exports = app;


--------------------------------------------------------------------



Voices (Voice Cloning) - /voices/*
Fast Playback (HLS Streaming) - /stories/prepare, /stories/{id}/status
Jobs - /jobs/*
Uploads - /uploads/presign
Audio Delivery Infrastructure

Full-Stack Developer APIs (Business Logic, CRUD)

Auth & Me - /auth/*, /me
Story Catalog - /catalog/stories/*
Stories Management - /stories/* (metadata only)
Billing - /billing/*
Usage & Settings - /usage, /me (PATCH/DELETE)
Consents - /consents
Favorites & Progress - /stories/:id/progress, /stories/:id/favorite
Feedback & Reporting - /feedback, /abuse/report
Family Sharing - /family/*
Nice-to-Haves - /health, /feature-flags, etc.


Technology Stack Integration
Node.js + Express/Fastify
├── MongoDB (main database)
├── AWS S3 (audio file storage)
├── AWS CloudFront (CDN for HLS streaming)
├── Redis (optional: caching, rate limiting)
└── JWT (authentication)
Complete Node.js + MongoDB API StructureCode // ============================================
// COMPLETE LUNEBI API STRUCTURE
// Node.js + Express + MongoDB
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const jwt = reqDetailed Breakdown Summary
AWS Freelancer ke APIs:

✅ Voice Cloning (POST /voices) - Audio upload, S3 storage, training jobs
✅ Voice Management (GET/DELETE /voices/:id)
✅ HLS Streaming - CloudFront se serve hoga
✅ Jobs Tracking (GET /jobs/:id)
✅ Upload Presigning - S3 presigned URLs

Full-Stack Developer ke APIs:

✅ Authentication (POST /auth/login, GET /me)
✅ Story Catalog (GET /catalog/stories)
✅ Stories CRUD - Metadata management
✅ Progress & Favorites - User preferences
✅ Family Sharing - Multi-user access
✅ Billing, Consents, Feedback - Business logic

Required NPM Packages:
bashnpm install express mongoose jsonwebtoken multer aws-sdk bcrypt cors dotenv helmet express-rate-limit
Environment Variables (.env):
bashPORT=3000
MONGODB_URI=mongodb://localhost:27017/lunebi
JWT_SECRET=your-super-secret-key
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=lunebi-audio
CLOUDFRONT_DOMAIN=cdn.lunebi.com