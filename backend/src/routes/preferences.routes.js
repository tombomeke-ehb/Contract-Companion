import { Router } from "express";
import {getPreferencesForUser,updatePreferencesForUser} from "../controllers/preferences.controller.js";

const router = Router();

router.get("/:userId", getPreferencesForUser);
router.put("/:userId", updatePreferencesForUser);

export default router;
