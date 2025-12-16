import express from "express";
import { createPerson } from "../controllers/user.controller.js";

const router = express.Router();

// POST /api/people
router.post("/", createPerson);

export default router;
