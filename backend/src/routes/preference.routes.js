import express from "express";
import { authenticate } from "../middleware/auth.js";
import { getPreferences, updatePreferences } from "../controllers/preference.controller.js";

const router = express.Router();

// Alle preference-routes vereisen een ingelogde gebruiker
router.use(authenticate);

router.get("/:userId", getPreferences);
router.put("/:userId", updatePreferences);

export default router;
