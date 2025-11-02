// ============================================
// USER APIs - PATCH /app/me
// ============================================
import Joi from "joi";
import { updateDocument,findOne } from "../../helpers/index.js";

const updateMeSchema = Joi.object({
  name: Joi.string().optional(),
  language: Joi.string().optional(),
});

const updateMe = async (req, res) => {
  try {
    const { error } = updateMeSchema.validate(req.body);
    if (error) {
      return res.status(400).send({
        status: 400,
        message: error.details[0].message
      });
    }

    const { name, language } = req.body;
    const id = req.params.id;
    let user = await findOne("user", { _id: id })
    if (!user) {
      return res.json({ status: 200, message: "Not User Found!" })
    }
    if (name) user.name = name;
    if (language) user.language = language;
    user.updatedAt = Date.now();

    //  await user.save();
    await updateDocument("user", { _id: id }, { ...req.body })
    return res.status(200).send({
      status: 200,
      id: user.firebaseUid,
      email: user.email,
      name: user.name,
      language: user.language,
      plan: user.plan
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).send({
      status: 500,
      message: error.message || "An unexpected error occurred."
    });
  }
};

export default updateMe;