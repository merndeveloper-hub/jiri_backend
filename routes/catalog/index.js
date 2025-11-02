import express from "express";

import getLibrary from "./get.js";
import getStoryById from "./getById.js";
import getFacets from "./getFilter.js";

const router = express.Router();


//----------get filter total count --------------------//
router.get("/getFacets",  getFacets);

//----------get story with filter --------------------//
router.get("/get",  getLibrary);

//----------get single story by id--------------------//
router.get("/:id",  getStoryById);



export default router;
