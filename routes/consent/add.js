// ============================================
// CONSENTS APIs - POST /app/consents
// ============================================
import Joi from "joi";
import { insertNewDocument } from "../../helpers/index.js";

const consentSchema = Joi.object({
  type: Joi.string().required(),
  version: Joi.string().required(),
  jurisdiction: Joi.string().optional(),
});

const createConsent = async (req, res) => {
  try {
    const id = req.params.id
    const { error } = consentSchema.validate(req.body);
    if (error) {
      return res.status(400).send({
        status: 400,
        message: error.details[0].message
      });
    }

    const { type, version, jurisdiction } = req.body;

    // ✅ Convert Mongoose save to insertNewDocument
    const consent = await insertNewDocument("consent", {
      // firebaseUid: req.firebaseUid,
      userId: id,
      consentKey: `${type}#${version}`,
      type: type,
      version: version,
      jurisdiction: jurisdiction || "US",
      ip: req.ip,
      userAgent: req.headers["user-agent"]
    });

    return res.status(201).send({
      status: 201,
      type,
      version,
      acceptedAt: consent.acceptedAt,
      message: 'Consent recorded'
    });
  } catch (error) {
    console.error("Error creating consent:", error);
    return res.status(500).send({
      status: 500,
      message: error.message || "An unexpected error occurred."
    });
  }
};

export default createConsent;