// backend/src/routes/contract.routes.js

import express from "express";
import { uploadContract } from "../middleware/upload.js";
import { analyzeContract, getContracts } from "../controllers/contract.controller.js";

const router = express.Router();

router.get("/", getContracts);
router.post("/upload", uploadContract, analyzeContract);

export default router;
