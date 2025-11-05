import express from "express";

import clearCache from "./delete.js";

import getCachedAudio from "./get.js";

const router = express.Router();


//----------get cache audio --------------------//
router.get("/getCachedAudio/:userId/:storyId",  getCachedAudio);

//----------delete store cache --------------------//
router.delete("/clearCache/:id",  clearCache);





export default router;
