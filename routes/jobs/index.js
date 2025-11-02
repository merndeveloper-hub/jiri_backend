import express from "express";


// import getMe from "./single.js";
 import getJobById from "./single.js";
import getJobs from "./get.js";

const router = express.Router();




// //----------post consent --------------------//
 router.get("/single/:id/:jobId",  getJobById);

//----------get data --------------------//
router.get("/:id",  getJobs);

export default router;
