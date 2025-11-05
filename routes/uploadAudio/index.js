import express from "express";


// import getMe from "./single.js";
 import createPresignedUrls from "./add.js";


const router = express.Router();




// //----------post consent --------------------//
 router.post("/createPresignedUrls/:id",  createPresignedUrls);



export default router;
