import express from "express";
import verifyToken from "./verify-token.js";

const router = express.Router();

router.post("/verify", verifyToken);

export default router;
