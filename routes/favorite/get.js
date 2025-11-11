// ============================================
// GET /app/favorites - Get user's favorite stories
// ============================================
import { findOne, find } from "../../helpers/index.js";

const getFavorites = async (req, res) => {
  try {
    const userId = req.params.id;

    //  Get user
    const user = await findOne("user", { _id: userId });

    if (!user) {
      return res.status(404).send({
        status: 404,
        message: "User not found"
      });
    }

    console.log(user, "users");

    //  Get story IDs from favorites array
    const storyIds = user.favorites || [];

    if (storyIds.length === 0) {
      return res.status(200).send({
        status: 200,
        total: 0,
        favorites: []
      });
    }

    //  Find all stories by storyId
    const stories = await find("story", { storyId: { $in: storyIds } });

    //  Format response with all fields
    const favorites = stories.map(story => ({
      id: story._id.toString(),
      storyId: story.storyId,
      title: story.title,
      description: story.description,
      status: story.status,
      is_mock: story.is_mock,
      category: story.category,
      categories: story.categories,
      ageGroup: story.ageGroup,
      age_min: story.age_min,
      age_max: story.age_max,
      duration: story.duration,
      duration_s: story.duration_s,
      durationMin: story.durationMin,
      mood: story.mood,
      textContent: story.textContent,
      audioLinks: story.audioLinks,
      assets: story.assets,
      languages: story.languages,
      isPro: story.isPro,
      tonightPic: story.tonightPic,
      thumbnailUrl: story.thumbnailUrl,
      image_url: story.image_url,
      audio_url: story.audio_url,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
      isFavorited: true
    }));

    console.log(favorites, "favorites");

    return res.status(200).send({
      status: 200,
      total: favorites.length,
      favorites
    });

  } catch (error) {
    console.error(" Error fetching favorites:", error);
    return res.status(500).send({
      status: 500,
      message: error.message || "An unexpected error occurred."
    });
  }
};

export default getFavorites;