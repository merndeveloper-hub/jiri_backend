import express from "express";


import deleteVoice from "./delete.js";






import { uploadVoice, upload } from "./add.js";
import getVoices from "./get.js";

const router = express.Router();

// Single audio file upload to S3
router.post("/voices/:id/upload", upload, uploadVoice);
router.get("/:id", getVoices);
// //----------delete store cache --------------------//
router.delete("/deleteVoice/:id/:voiceId", deleteVoice);
export default router;
