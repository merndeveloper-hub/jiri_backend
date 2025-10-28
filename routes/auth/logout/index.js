import Joi from "joi";
import { deleteDocument } from "../../../helpers/index.js";
import mongoose from "mongoose";

const schema = Joi.object({
  id: Joi.string().required(),
});

const logout = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;

    const deleteToken = await deleteDocument("token", { user_id: id });
    console.log(deleteToken, "delete");

    if (!deleteToken || deleteToken.deletedCount === 0) {
      return res.status(400).send({
        status: 400,
        message: "No token found for the specified user.",
        details:
          "Ensure the user ID is correct and that a token exists for this user.",
      });
    }

    await session.commitTransaction();
    session.endSession();

    return res
      .status(200)
      .send({ status: 200, message: "Logged out successfully" });
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).send({ status: 400, message: e.message });
  }
};

export default logout;
