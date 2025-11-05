import express from "express";

import deleteVoice from "./delete.js";

import enrollVoice from "./add.js";

const router = express.Router();


//----------get cache audio --------------------//
router.post("/enrollVoice/:id",  enrollVoice);

//----------delete store cache --------------------//
router.delete("/deleteVoice/:id/:voiceId",  deleteVoice);





export default router;
