import express from "express";
import { getPreferences, updatePreferences } from "../controllers/preference.controller.js";

const router = express.Router();

router.get("/:userId", getPreferences);
router.put("/:userId", updatePreferences);

export default router;
