import { Router } from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";

const router = Router();

// NL: Auth-routes voor registratie en login
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
