
// ============================================
// UPLOADS APIs - POST /app/uploads/presign
// ============================================
import Joi from "joi";
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const presignSchema = Joi.object({
  files: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      type: Joi.string().required(),
    })
  ).required(),
  purpose: Joi.string().valid('voice_sample', 'audio').required(),
});

const createPresignedUrls = async (req, res) => {
  try {
    const {id} = req.params
    const { error } = presignSchema.validate(req.body);
    if (error) {
      return res.status(400).send({
        status: 400,
        message: error.details[0].message
      });
    }

    const { files, purpose } = req.body;
    const urls = [];
    
    for (const file of files) {
      const key = `${purpose}/${id}/${Date.now()}_${file.name}`;
      
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Expires: 3600,
        ContentType: file.type
      };
      
      const uploadUrl = s3.getSignedUrl('putObject', params);
      
      urls.push({
        name: file.name,
        url: uploadUrl,
        key: key
      });
    }
    
    return res.status(200).send({
      status: 200,
      urls,
      maxBytes: 20000000,
      expiresIn: 3600
    });
  } catch (error) {
    console.error("Error creating presigned URLs:", error);
    return res.status(500).send({ 
      status: 500, 
      message: error.message || "An unexpected error occurred."
    });
  }
};

export default createPresignedUrls;