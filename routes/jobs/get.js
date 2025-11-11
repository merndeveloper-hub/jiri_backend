// ============================================
// JOBS APIs - GET /app/jobs
// ============================================
import Joi from "joi";
import { getDataWithLimit } from "../../helpers/index.js";

const jobsQuerySchema = Joi.object({
  type: Joi.string().optional(),
  status: Joi.string().optional(),
});

const getJobs = async (req, res) => {
  try {
    const {id} = req.params
    const { error } = jobsQuerySchema.validate(req.query);
    if (error) {
      return res.status(400).send({
        status: 400,
        message: error.details[0].message
      });
    }

    const { type, status } = req.query;
    
    const query = { userId: id};
    if (type) query.type = type;
    if (status) query.status = status;
    
 const jobs = await getDataWithLimit(
      "job",
      query,
      {}, 
     {},
     {limit: 20}
    );


    
    return res.status(200).send({
      status: 200,
      jobs: jobs.map(j => ({
        jobId: j.jobId,
        type: j.type,
        status: j.status,
        createdAt: j.createdAt
      }))
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return res.status(500).send({ 
      status: 500, 
      message: error.message || "An unexpected error occurred."
    });
  }
};

export default getJobs;