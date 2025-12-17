import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { getPreferencesForUser, updatePreferencesForUser } from "../controllers/preferences.controller.js";

const router = Router();

// Alle alternative preferences-routes vereisen ook een ingelogde gebruiker
router.use(authenticate);

router.get("/:userId", getPreferencesForUser);
router.put("/:userId", updatePreferencesForUser);

export default router;
