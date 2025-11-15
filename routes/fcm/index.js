import express from "express";

//----------Firebase-------------//


import sendNotification from "./sendNotification.js";
import updateFcmToken from "./update.js";


const router = express.Router();

//update FCM token
router.put("/:id/:fcmToken", updateFcmToken);



// sendNotification
router.post("/sendNotification", sendNotification);

export default router;
