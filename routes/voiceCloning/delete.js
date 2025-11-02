// ============================================
// VOICE CLONING APIs - DELETE /runtime/voices/:id
// ============================================

const deleteVoice = async (req, res) => {
  try {
    const voiceProfile = await findOneAndSelect("voiceProfile", {
      voiceId: req.params.id,
      firebaseUid: req.firebaseUid
    });
    
    if (!voiceProfile) {
      return res.status(404).send({
        status: 404,
        message: 'Voice not found'
      });
    }
    
    await axios.delete(`${RUNTIME_API_URL}/runtime/voices/${req.params.id}`, {
      headers: { 'Authorization': req.headers.authorization }
    });
    
    voiceProfile.status = 'deleted';
    await voiceProfile.save();
    
    req.user.voiceId = null;
    await req.user.save();
    
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting voice:", error);
    return res.status(400).send({ 
      status: 400, 
      message: error.message || "An unexpected error occurred."
    });
  }
};

export { deleteVoice };