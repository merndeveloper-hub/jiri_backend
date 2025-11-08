// import express from "express";

 import deleteVoice from "./delete.js";

// import enrollVoice from "./add.js";

// const router = express.Router();


// //----------get cache audio --------------------//
// router.post("/enrollVoice/:id",  enrollVoice);

// //----------delete store cache --------------------//
// router.delete("/deleteVoice/:id/:voiceId",  deleteVoice);





// export default router;


// routes/voiceRoutes.js
import express from "express";




import { uploadVoice, upload } from "./add.js";

const router = express.Router();

// Single audio file upload to S3
router.post("/voices/:id/upload", upload, uploadVoice);

// //----------delete store cache --------------------//
 router.delete("/deleteVoice/:id/:voiceId",  deleteVoice);
export default router;
