import express from "express";

import auth from "./auth/index.js";


import refresh_token from "./check-token/index.js";


const router = express.Router();


router.use("/auth", auth);


router.use("/refresh_token", refresh_token);


export default router;
