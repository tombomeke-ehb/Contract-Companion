import express from "express";
import { authenticate, isAdmin } from "../middleware/auth.js";
import { listPeople, createPerson, deletePerson } from "../controllers/user.controller.js";

const router = express.Router();

// Alle user-routes zijn alleen toegankelijk voor ingelogde admins
router.use(authenticate, isAdmin);

// Fetch all people (admin only)
router.get("/", listPeople);

// Create a new person (admin only)
router.post("/", createPerson);

// Delete a person by id (admin only)
router.delete("/:id", deletePerson);

export default router;
