import express from "express";
import { authenticate, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Alle people-routes zijn enkel toegankelijk voor admins
router.use(authenticate, isAdmin);

// Alle routes hieronder zijn admin-only
router.get("/", async (req, res) => {
  res.json({ message: "People list (admin only)" });
});

router.post("/", async (req, res) => {
  res.json({ message: "Create person (admin only)" });
});

router.put("/:id", async (req, res) => {
  res.json({ message: "Update person (admin only)" });
});

router.delete("/:id", async (req, res) => {
  res.json({ message: "Delete person (admin only)" });
});

export default router;
