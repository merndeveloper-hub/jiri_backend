import { getDataWithLimit, find } from "../../helpers/index.js";

const getLibrary = async (req, res) => {
  try {
    const { categories, age, duration, mood, search, isPro, status, tonightPic } = req.query;
    
    const query = {};
    if (categories) query.categories = categories;
    if (age) query.ageGroup = age;
    if (duration) query.duration = duration;
    if (mood) query.mood = mood;
    if (search) query.title = { $regex: search, $options: 'i' };
    if (isPro !== undefined) query.isPro = isPro === 'true';
    if (status) query.status = status;
    if (tonightPic !== undefined) query.tonightPic = tonightPic === 'true';
    
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const skip = (page - 1) * pageSize;

    // ✅ Sort parameter add kiya (latest first)
    const sortedBy = { createdAt: -1 }; // ya { title: 1 } for alphabetical

    const stories = await getDataWithLimit(
      "story",
      query,
      sortedBy,  // ✅ Yeh missing tha
      skip,
      pageSize
    );

    // Total count ke liye
    const totalStories = await find("story", query);
    const total = totalStories.length;

    return res.status(200).send({
      status: 200,
      items: stories.map(s => ({
        id: s.storyId || s._id,
        title: s.title,
        description: s.description,
        status: s.status,
        is_mock: s.is_mock,
        categories: s.categories,
        ageGroup: s.ageGroup,
        age_min: s.age_min,
        age_max: s.age_max,
        duration: s.duration,
        duration_s: s.duration_s,
        durationMin: s.durationMin,
        mood: s.mood,
        textContent: s.textContent,
        audioLinks: s.audioLinks,
        assets: s.assets,
        languages: s.languages,
        isPro: s.isPro,
        tonightPic: s.tonightPic,
        thumbnailUrl: s.thumbnailUrl,
        image_url: s.image_url,
        audio_url: s.audio_url,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt
      })),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error("Error fetching library:", error);
    return res.status(400).send({ 
      status: 400, 
      message: error.message || "An unexpected error occurred."
    });
  }
};

export default getLibrary;