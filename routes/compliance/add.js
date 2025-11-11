// ============================================
// COMPLIANCE APIs - POST /app/me/export
// ============================================
import { findOne, insertNewDocument, find } from "../../helpers/index.js";
const exportUserData = async (req, res) => {
  try {
    const id = req.params.id;
    let user = await findOne("user", { _id: id })
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const job = await insertNewDocument("job", {
      jobId,
      userId: user._id,
      //firebaseUid: req.firebaseUid,
      type: 'export',
      status: 'queued',
      payload: false
    });

    //  Get favorites (multiple documents)
    const favorites = await find("story", {
      storyId: { $in: user.favorites }
    });

    //  Get consents (multiple documents)
    const consents = await find("consent", {
      userId: id
    });

    //  Get plays with limit (multiple documents)
    const plays = await find("play", {
      userId: id
    }, null, { limit: 100 });

    //  Get voice profile (single document)
    const voiceProfile = await findOne("voiceProfile", {
      userId: id
    });

    const exportData = {
      user: {
        email: user.email,
        name: user.name,
        plan: user.plan,
        createdAt: user.createdAt
      },
      favorites: favorites.map(s => ({ id: s.storyId, title: s.title })),
      consents: consents.map(c => ({ type: c.type, acceptedAt: c.acceptedAt })),
      recentPlays: plays.map(p => ({ storyId: p.storyId, timestamp: p.timestamp })),
      voiceProfile: voiceProfile ? { id: voiceProfile.voiceId, status: voiceProfile.status } : null,
      exportedAt: new Date().toISOString()
    };

    const exportJson = JSON.stringify(exportData, null, 2);

    job.status = 'completed';
    job.resultUrl = 'data:application/json;base64,' + Buffer.from(exportJson).toString('base64');
    job.updatedAt = Date.now();
    await job.save();

    return res.status(200).send({
      status: 200,
      export: {
        jobId: job.jobId,
        status: 'completed',
        data: exportData,
        message: 'Export completed. In production, this will be emailed to you.'
      }
    });
  } catch (error) {
    console.error("Error exporting user data:", error);
    return res.status(400).send({
      status: 400,
      message: error.message || "An unexpected error occurred."
    });
  }
};

export default exportUserData;