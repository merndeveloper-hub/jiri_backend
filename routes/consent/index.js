import express from "express";


// import getMe from "./single.js";
 import createConsent from "./add.js";
import getConsents from "./get.js";

const router = express.Router();




// //----------post consent --------------------//
 router.post("/:id",  createConsent);

//----------get data --------------------//
router.get("/:id",  getConsents);

export default router;
