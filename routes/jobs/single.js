// ============================================
// JOBS APIs - GET /app/jobs/:id
// ============================================

import { findOne } from "../../helpers/index.js";



const getJobById = async (req, res) => {
  try {
    const { id, jobId } = req.params



    const job = await findOne("job", {
      jobId: jobId,
      userId: id
    });

    if (!job) {
      return res.status(404).send({
        status: 404,
        message: 'Job not found'
      });
    }

    return res.status(200).send({
      status: 200,
      jobId: job.jobId,
      type: job.type,
      status: job.status,
      resultUrl: job.resultUrl,
      error: job.error,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    return res.status(500).send({
      status: 500,
      message: error.message || "An unexpected error occurred."
    });
  }
};

export default getJobById;