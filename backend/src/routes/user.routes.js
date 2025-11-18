import express from "express";

const router = express.Router();

// Dummy user route for testing
router.get("/", (req, res) => {
  res.json({ message: "User route werkt!" });
});

export default router;
