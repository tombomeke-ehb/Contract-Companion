import express from "express";

const router = express.Router();

// Dummy login route for testing
router.post("/login", (req, res) => {
  res.json({ message: "Login route werkt!" });
});

export default router;
