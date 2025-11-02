// GET /runtime/stories/:id/status - Check story generation status
app.get('/runtime/stories/:id/status', authenticateFirebase, async (req, res) => {
  try {
    const response = await axios.get(
      `${RUNTIME_API_URL}/runtime/stories/${req.params.id}/status`,
      { headers: { 'Authorization': req.headers.authorization } }
    );
    
    const statusData = response.data;
    
    // If completed, cache the audio
    if (statusData.status === 'completed' && statusData.audioUrl) {
      const story = await Story.findOne({ storyId: req.params.id });
      
      const cache = new AudioCache({
        userId: req.user._id,
        storyId: req.params.id,
        voiceType: statusData.voiceType || 'preset',
        audioUrl: statusData.audioUrl,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isFavorited: req.user.favorites.includes(req.params.id)
      });
      await cache.save();
    }
    
    res.json(statusData);
  } catch (error) {
    res.status(500).json({ 
      error: { code: 'STATUS_CHECK_ERROR', message: error.message } 
    });
  }
});