// ============================================
// FAVORITES APIs - POST /app/favorites
// ============================================
import Joi from "joi";
import { 
  findOne, 
  updateDocument, 
  pushIntoArray, 
  updateDocuments 
} from "../../helpers/index.js";

const favoriteSchema = Joi.object({
  storyId: Joi.string().required(),
  action: Joi.string().valid('add', 'remove').required(),
});

const manageFavorites = async (req, res) => {
  try {
    // ✅ Validation
    await favoriteSchema.validateAsync(req.body);
    const id  = req.params.id
    const { storyId, action } = req.body;
  //  const userId = req.user._id || req.user.id; // Auth middleware se user milega
    
//  const userExists = await findOne("user", { _id: id });
//     if (!userExists) {
//       return res.status(404).send({
//         status: 404,
//         message: "User not found"
//       });
//     }

    // ✅ Check if story exists
    const storyExists = await findOne("story", { storyId: storyId });
    if (!storyExists) {
      return res.status(404).send({
        status: 404,
        message: "Story not found"
      });
    }

    // ✅ Get current user
    const user = await findOne("user", { _id: id });
    if (!user) {
      return res.status(404).send({
        status: 404,
        message: "User not found"
      });
    }
console.log(user,"users");

    let updatedUser;

    if (action === 'add') {
      // ✅ Check if already in favorites
      if (user.favorites && user.favorites.includes(storyId)) {
        return res.status(400).send({
          status: 400,
          message: "Story already in favorites"
        });
      }

      // ✅ Add to favorites using pushIntoArray
      updatedUser = await pushIntoArray(
        "user",
        { _id: id },
        { favorites: storyId }
      );

      // ✅ Update AudioCache (agar collection hai)
      await updateDocument(
        "audioCache",
        { userId: id, storyId: storyId },
        { isFavorited: true, updatedAt: new Date() }
      );

    } else if (action === 'remove') {
      // ✅ Remove from favorites using $pull
      updatedUser = await updateDocument(
        "user",
        { _id: id },
        { $pull: { favorites: storyId } },
        { new: true }
      );

      // ✅ Update AudioCache
      await updateDocument(
        "audioCache",
        { userId: id, storyId: storyId },
        { isFavorited: false, updatedAt: new Date() }
      );
    }

    // ✅ Update user's updatedAt
    await updateDocument(
      "user",
      { _id: id },
      { updatedAt: new Date() }
    );

    // ✅ Get fresh user data with favorites
    const freshUser = await findOne("user", { _id: id });

    return res.status(200).send({ 
      status: 200,
      favorites: freshUser.favorites || [],
      message: action === 'add' ? 'Added to favorites' : 'Removed from favorites'
    });

  } catch (error) {
    console.error("❌ Error managing favorites:", error);
    return res.status(500).send({ 
      status: 500, 
      message: error.message || "An unexpected error occurred."
    });
  }
};

export default manageFavorites;