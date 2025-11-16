import express from "express";


import getMe from "./single.js";
import updateMe from "./update.js";
import getUsage from "./get.js";
import updateProfile from "./update.js";


import multipart from "connect-multiparty";


const multipartMiddleware = multipart();
const router = express.Router();


//----------add favorite story in user --------------------//
//router.post("/manageFavorites/:id",  manageFavorites);

router.put(
  "/update/:id",
  
  multipartMiddleware,
  updateProfile
);


//----------get user stats --------------------//
router.get("/single/:id",  getMe);

//----------update user --------------------//
//router.put("/:id",  updateMe);

//----------user usage --------------------//
router.get("/play/:id",  getUsage);

export default router;





