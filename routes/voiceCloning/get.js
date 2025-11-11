// ============================================
// GET /app/favorites - Get user's favorite stories
// ============================================
import { findOne, findAndSort } from "../../helpers/index.js";

const getVoices = async (req, res) => {
  try {
    const id = req.params.id;

    //  Get user
    const user = await findOne("user", { _id: id });

    if (!user) {
      return res.status(404).send({
        status: 404,
        message: "User not found"
      });
    }

    console.log(user, "users");

    //  Get story IDs from favorites array
const getVoice = await findAndSort("voiceProfile", { userId: id },{ createdAt: -1 })

    return res.status(200).send({
      status: 200,
     data:{getVoice}
    });

  } catch (error) {
    console.error(" Error fetching favorites:", error);
    return res.status(500).send({
      status: 500,
      message: error.message || "An unexpected error occurred."
    });
  }
};

export default getVoices;