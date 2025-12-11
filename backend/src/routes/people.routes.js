import express from "express";
import { createUserAdmin } from "../controllers/user.controller.js";

const router = express.Router();

// POST /api/people
router.post("/", createUserAdmin);

export default router;
