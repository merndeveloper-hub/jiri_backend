// ============================================
// GET /app/favorites - Get user's favorite stories
// ============================================
import { findOne,find } from "../../helpers/index.js";


const getFavorites = async (req, res) => {
  try {
    const userId = req.params.id;

    // ✅ Get user
    const user = await findOne("user", { _id: userId });

    if (!user) {
      return res.status(404).send({
        status: 404,
        message: "User not found"
      });
    }

    console.log(user, "users");

    // ✅ Get story IDs from favorites array
    const storyIds = user.favorites || [];

    if (storyIds.length === 0) {
      return res.status(200).send({
        status: 200,
        total: 0,
        favorites: []
      });
    }

    // ✅ Find all stories by storyId
    const stories = await find("story",{ storyId: { $in: storyIds } });

    // ✅ Format response
    const favorites = stories.map(story => ({
      id: story._id.toString(),
      storyId: story.storyId,
      title: story.title,
      description: story.description,
      category: story.category,
      ageGroup: story.ageGroup,
      duration: story.duration,
      durationMin: story.durationMin,
      mood: story.mood,
      isPro: story.isPro,
      thumbnailUrl: story.thumbnailUrl,
      audioLinks: story.audioLinks,
      isFavorited: true
    }));

    console.log(favorites, "favorites");

    return res.status(200).send({
      status: 200,
      total: favorites.length,
      favorites
    });

  } catch (error) {
    console.error("❌ Error fetching favorites:", error);
    return res.status(500).send({
      status: 500,
      message: error.message || "An unexpected error occurred."
    });
  }
};

export default getFavorites;