import express from "express";

import getGenerStory from "./get.js";

import prepareStory from "./add.js";

const router = express.Router();


//----------get cache audio --------------------//
router.post("/prepareStory/:id", prepareStory);

//----------delete store cache --------------------//
router.get("/runtime/stories/:id/:storyId", getGenerStory);





export default router;
