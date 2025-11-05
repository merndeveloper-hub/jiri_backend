import express from "express";



import getFeatureFlags from "./get.js";

const router = express.Router();


//----------get feature flags--------------------//
router.get("/getFeatureFlags/:id",  getFeatureFlags);







export default router;
