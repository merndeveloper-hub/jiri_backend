import express from "express";

import createStory from "./add.js";
import getStats from "./get.js";
import updateStory from "./update.js";

const router = express.Router();



//----------admin create story --------------------//
router.post("/createStory",  createStory);

//----------admin get overall stats--------------------//
router.get("/getStats",  getStats);


//----------admin create story --------------------//
router.put("/updateStory/:id",  updateStory);

export default router;
