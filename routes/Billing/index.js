import express from "express";

import createCheckoutSession from "./add.js";

import getUserPlan from "./get.js";

const router = express.Router();
import stripeSuccess from "./stripeSuccess.js";
import stripeCancel from "./stripeCancel.js";

//----------get filter total count --------------------//
router.get("/getUserPlan/:id",  getUserPlan);

//----------get story with filter --------------------//
router.post("/checkoutSession/:id",  createCheckoutSession);

//------------user  stripe payment Successfully page-----//
router.get("/stripesuccess", stripeSuccess);

//------------user stripe payment cancel page-----//
router.get("/stripecancel", stripeCancel);

export default router;


// // routes/billing.js
// import express from "express";
// import createCheckoutSession from "../controllers/billing/checkout.js";
// import stripeSuccess from "../controllers/billing/success.js";
// import stripeCancel from "../controllers/billing/cancel.js";
// import stripeWebhook from "../controllers/billing/webhook.js";

// const router = express.Router();

// router.post("/subscriptions/checkout/:id", createCheckoutSession);
// router.get("/stripesuccess", stripeSuccess);
// router.get("/stripecancel", stripeCancel);
// router.post("/webhook", express.raw({ type: 'application/json' }), stripeWebhook);

// export default router;