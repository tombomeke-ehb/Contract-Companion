import bcrypt from "bcryptjs";
import { findUserByEmail, createUser } from "../services/user.service.js";
import jwt from "jsonwebtoken";

// REGISTER
export async function registerUser(req, res) {
  try {
    // Ne pas logger le mot de passe en clair ni les données sensibles
    const { name, surname, email, password } = req.body || {};

    if (!name || !surname || !email || !password) {
      return res.status(400).json({ error: "Please fill in all fields (including last name)." });
    }

    // Basic password policy: minimum 8 characters
    const pwdOk = typeof password === "string" && password.length >= 8;
    if (!pwdOk) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    // Check if user already exists
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Email already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (surname is required) and get basic info back (including new ID)
    const createdUser = await createUser(name, email, hashedPassword, surname);

    // If JWT secret is missing, we still confirm account creation
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.warn("JWT_SECRET is not defined. Returning response without token.");
      return res.status(201).json({
        message: "Account created. Please log in.",
        user: {
          id: createdUser.id,
          name: createdUser.name,
          surname: createdUser.surname,
          email: createdUser.email,
          isAdmin: createdUser.isAdmin === 1,
        },
      });
    }

    // Create JWT token for auto-login
    const token = jwt.sign(
      {
        id: createdUser.id,
        email: createdUser.email,
        isAdmin: createdUser.isAdmin === 1,
      },
      jwtSecret,
      { expiresIn: "2h" }
    );

    // Return token and user info (auto-login after registration)
    return res.status(201).json({
      message: "Account created.",
      token,
      user: {
        id: createdUser.id,
        name: createdUser.name,
        surname: createdUser.surname,
        email: createdUser.email,
        isAdmin: createdUser.isAdmin === 1,
      },
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// LOGIN
export async function loginUser(req, res) {
  try {
    let { email, password } = req.body;
    console.log(`[DEBUG AUTH] Login attempt for email: "${email}"`);
    
    // Trim email to handle accidental spaces
    if (email) email = email.trim();
    console.log(`[DEBUG AUTH] Trimmed email: "${email}"`);

    const user = await findUserByEmail(email);
    if (!user) {
      console.log(`[DEBUG AUTH] User not found in DB for email: "${email}"`);
      return res.status(401).json({ error: "Invalid login." });
    }

    const dbHash = user.PASSWORD || user.password;
    console.log(`[DEBUG AUTH] User found: ${user.ID_USER}, stored hash starts with: ${dbHash.substring(0, 10)}...`);

    // Vergelijk het ingevoerde wachtwoord met het gehashte wachtwoord
    const isValid = await bcrypt.compare(password, dbHash);
    console.log(`[DEBUG AUTH] Password comparison result: ${isValid}`);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid login." });
    }

    // Maak een JWT-token aan
    const token = jwt.sign(
      {
        id: user.ID_USER || user.id_user,
        email: user.EMAIL || user.email,
        isAdmin: (user.ISADMIN || user.isadmin) === 1,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Stuur token en gebruikersinformatie terug
    return res.json({
      message: "Login success",
      token,
      user: {
        id: user.ID_USER || user.id_user,
        name: user.NAME || user.name,
        surname: user.SURNAME || user.surname,
        email: user.EMAIL || user.email,
        isAdmin: (user.ISADMIN || user.isadmin) === 1,
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
