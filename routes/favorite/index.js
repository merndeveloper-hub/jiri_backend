import express from "express";


import getFavorites from "./get.js";
import manageFavorites from "./add.js";

const router = express.Router();


//----------add favorite story in user --------------------//
router.post("/manageFavorites/:id",  manageFavorites);

//----------get favourite story --------------------//
router.get("/:id",  getFavorites);





export default router;
