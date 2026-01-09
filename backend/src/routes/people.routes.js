import express from "express";
import bcrypt from "bcryptjs";
import { authenticate, isAdmin } from "../middleware/auth.js";
import { listPeople, createPerson, deletePerson, deleteUserContracts } from "../services/user.service.js";

const router = express.Router();

// All routes in this file require authentication and admin privileges
router.use(authenticate, isAdmin);

// GET /api/people - get all users
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
      date: new Date().toISOString().split('T')[0] // Placeholder, as Oracle doesn't provide creation date
    }));

    res.json(formattedPeople);
  } catch (error) {
    console.error("Error fetching people:", error);
    res.status(500).json({ error: "Failed to fetch people" });
  }
});

// POST /api/people - makes an new user
router.post("/", async (req, res) => {
  try {
    const { name, surname, email, password, isAdmin = false } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // makes the new user
    const newId = await createPerson({
      name,
      surname: surname || name,
      email,
      passwordHash,
      isAdmin: isAdmin ? 1 : 0
    });

    // Send the new user data as response
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

// PUT /api/people/:id - Update an user
router.put("/:id", async (req, res) => {
  res.json({ message: "Update person (admin only)" });
});

// DELETE /api/people/:id - delete an user (and all their contracts)
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

// DELETE /api/people/:id/data - delete all contract data for a user (keep the user)
router.delete("/:id/data", async (req, res) => {
  try {
    const { id } = req.params;

    await deleteUserContracts(id);

    res.json({ message: "User data deleted successfully" });
  } catch (error) {
    console.error("Error deleting user data:", error);
    res.status(500).json({ error: "Failed to delete user data" });
  }
});

export default router;
