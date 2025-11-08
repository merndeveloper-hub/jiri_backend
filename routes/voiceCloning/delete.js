// ============================================
// VOICE CLONING APIs - DELETE /runtime/voices/:id
// ============================================


import { updateDocument, findOneAndSelect, deleteDocument } from "../../helpers/index.js";

const deleteVoice = async (req, res) => {
  try {
   // const RUNTIME_API_URL = process.env.RUNTIME_API_URL || 'https://runtime-api.lunebi.com';
    const { id, voiceId } = req.params
    const voiceProfile = await findOneAndSelect("voiceProfile", {
      _id: voiceId,
      userId: id
    });

    if (!voiceProfile) {
      return res.status(400).send({
        status: 400,
        message: 'Voice not found'
      });
    }

    // await axios.delete(`${RUNTIME_API_URL}/runtime/voices/${voiceId}`, {
    //   headers: { 'Authorization': req.headers.authorization }
    // });

    await deleteDocument("voiceProfile", {
     _id: voiceId,
      userId: id
    })

    // voiceProfile.status = 'deleted';
    // await voiceProfile.save();

  await updateDocument(
  "user",
  { _id: id },
  { $pull: { voiceProfileId: voiceId  } }
);

    // req.user.voiceId = null;
    // await req.user.save();
 return res.status(200).send({
      status: 200,
    
    });
   // return res.status(204).send();
  } catch (error) {
    console.error("Error deleting voice:", error);
    return res.status(400).send({
      status: 400,
      message: error.message || "An unexpected error occurred."
    });
  }
};

export default deleteVoice;