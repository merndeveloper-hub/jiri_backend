import express from "express";

import auth from "./auth/index.js";
import admin  from "./admin/story/index.js"
import catalog  from "./catalog/index.js"
import favorite  from "./favorite/index.js"
import billing  from "./Billing/index.js"
import user  from "./user/index.js"
import compliance  from "./compliance/index.js"
import consent  from "./consent/index.js"
import jobs  from "./jobs/index.js"
import refresh_token from "./check-token/index.js";


const router = express.Router();


router.use("/auth", auth);

router.use("/admin", admin);

router.use("/catalog", catalog);

router.use("/favorite", favorite);

router.use("/billing", billing);

router.use("/user", user);

router.use("/compliance", compliance);

router.use("/consent", consent);

router.use("/jobs", jobs);

router.use("/refresh_token", refresh_token);


export default router;
