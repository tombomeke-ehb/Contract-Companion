// backend/src/controllers/auth.controller.js

import bcrypt from "bcrypt";
import { findUserByEmail, createUser } from "../services/user.service.js";

/**
 * Registratie
 */
export async function register(req, res) {
  const { name, email, password } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: "Vul alle velden in." });
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ message: "E-mail bestaat al." });
  }

  const userId = await createUser(name, email, password);

  if (!userId) {
    return res.status(500).json({ message: "Registratie mislukt." });
  }

  res.status(201).json({
    message: "Account aangemaakt.",
    userId,
  });
}

/**
 * Login
 */
export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "E-mail en wachtwoord vereist." });
  }

  const user = await findUserByEmail(email);

  if (!user) {
    return res.status(401).json({ message: "Ongeldige login." });
  }

  const userId = user[0];
  const name = user[1];
  const emailDB = user[2];
  const hashedPw = user[3];
  const isAdmin = user[4];

  const isMatch = await bcrypt.compare(password, hashedPw);

  if (!isMatch) {
    return res.status(401).json({ message: "Ongeldige login." });
  }

  res.json({
    message: "Login OK",
    user: {
      id: userId,
      name,
      email: emailDB,
      isAdmin,
    },
  });
}
