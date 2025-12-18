// backend/src/routes/calendar.routes.js

import express from "express"
import { authenticate } from "../middleware/auth.js"
import { generateIcs } from "../controllers/calendar.controller.js"

const router = express.Router()

// Authenticated calendar ICS generation
router.get("/calendar/event.ics", authenticate, generateIcs)

export default router
