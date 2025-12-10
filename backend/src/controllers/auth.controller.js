// Auth-logica: registreren + inloggen
// Korte NL-commentaar zodat team direct begrijpt wat gebeurt.

import bcrypt from "bcryptjs";
import {
  findUserByEmail,
  createUser
} from "../services/user.service.js";

const SALT_ROUNDS = 10;
// NL: Sterkte van hashing. 10 = veilig en performant.

/**
 * POST /api/auth/register
 * NL: "Maakt een nieuwe gebruiker aan als email nog niet bestaat."
 */
export async function registerUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email en wachtwoord zijn verplicht." });

  try {
    // Check of user al bestaat
    const existingUser = await findUserByEmail(email);
    if (existingUser)
      return res.status(409).json({ message: "Email bestaat al." });

    // Wachtwoord hashen
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Nieuwe user opslaan (standaard geen admin → 0)
    const userId = await createUser(email, passwordHash, 0);

    return res.status(201).json({
      message: "Account succesvol aangemaakt.",
      userId
    });

  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Serverfout tijdens registratie." });
  }
}

/**
 * POST /api/auth/login
 * NL: "Controleren of user bestaat + wachtwoord vergelijken."
 */
export async function loginUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email en wachtwoord zijn verplicht." });

  try {
    // User ophalen uit database
    const user = await findUserByEmail(email);
    if (!user)
      return res.status(401).json({ message: "Ongeldige login." });

    // Wachtwoord vergelijken met hash
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match)
      return res.status(401).json({ message: "Ongeldige login." });

    // Admin-check: 1 = admin, 0 = gewone user
    const isAdmin = user.isAdmin === 1;

    return res.status(200).json({
      message: "Login geslaagd.",
      userId: user.id,
      isAdmin
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Serverfout tijdens login." });
  }
}
