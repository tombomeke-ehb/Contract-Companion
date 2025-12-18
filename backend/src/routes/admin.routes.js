import express from "express";
import { authenticate, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Beveiligde admin route
router.get("/admin", authenticate, isAdmin, (req, res) => {
  res.json({ message: "Welcome admin" });
});

export default router;
