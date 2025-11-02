import express from "express";


import getMe from "./single.js";
import updateMe from "./update.js";
import getUsage from "./get.js";

const router = express.Router();


//----------add favorite story in user --------------------//
//router.post("/manageFavorites/:id",  manageFavorites);

//----------get user stats --------------------//
router.get("/single/:id",  getMe);

//----------update user --------------------//
router.put("/:id",  updateMe);

//----------user usage --------------------//
router.get("/play/:id",  getUsage);

export default router;
