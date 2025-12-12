import express from "express";
import { listPeople, createPerson, deletePerson } from "../controllers/user.controller.js";

const router = express.Router();

// Fetch all people
router.get("/", listPeople);

// Create a new person
router.post("/", createPerson);

// Delete a person by id
router.delete("/:id", deletePerson);

export default router;
