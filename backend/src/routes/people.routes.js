import express from "express";
import bcrypt from "bcryptjs";
import { authenticate, isAdmin } from "../middleware/auth.js";
import { listPeople, createPerson, deletePerson } from "../services/user.service.js";

const router = express.Router();

// Alle people-routes zijn enkel toegankelijk voor admins
router.use(authenticate, isAdmin);

// GET /api/people - Haal alle gebruikers op
router.get("/", async (req, res) => {
  try {
    const people = await listPeople();

    // Transform Oracle result to expected format
    const formattedPeople = people.map(person => ({
      id: person.ID_USER,
      name: person.NAME,
      surname: person.SURNAME,
      email: person.EMAIL,
      isAdmin: person.ISADMIN === 1,
      date: new Date().toISOString().split('T')[0] // Placeholder, kan later uit database komen
    }));

    res.json(formattedPeople);
  } catch (error) {
    console.error("Error fetching people:", error);
    res.status(500).json({ error: "Failed to fetch people" });
  }
});

// POST /api/people - Maak een nieuwe gebruiker aan
router.post("/", async (req, res) => {
  try {
    const { name, surname, email, password, isAdmin = false } = req.body;

    // Validatie
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    // Hash het wachtwoord
    const passwordHash = await bcrypt.hash(password, 10);

    // Maak de gebruiker aan
    const newId = await createPerson({
      name,
      surname: surname || name,
      email,
      passwordHash,
      isAdmin: isAdmin ? 1 : 0
    });

    // Stuur de nieuwe gebruiker terug
    res.status(201).json({
      id: newId,
      name,
      surname: surname || name,
      email,
      isAdmin,
      date: new Date().toISOString().split('T')[0]
    });
  } catch (error) {
    console.error("Error creating person:", error);
    res.status(500).json({ error: "Failed to create person" });
  }
});

// PUT /api/people/:id - Update een gebruiker
router.put("/:id", async (req, res) => {
  res.json({ message: "Update person (admin only)" });
});

// DELETE /api/people/:id - Verwijder een gebruiker
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const rowsAffected = await deletePerson(id);

    if (rowsAffected === 0) {
      return res.status(404).json({ error: "Person not found" });
    }

    res.json({ message: "Person deleted successfully" });
  } catch (error) {
    console.error("Error deleting person:", error);
    res.status(500).json({ error: "Failed to delete person" });
  }
});

export default router;
