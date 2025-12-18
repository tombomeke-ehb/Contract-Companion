import bcrypt from "bcryptjs";
import { findUserByEmail, createUser } from "../services/user.service.js";
import jwt from "jsonwebtoken";

// REGISTER
export async function registerUser(req, res) {
  try {
    console.log("REQ BODY =", req.body);

    const { name, surname, email, password } = req.body;

    if (!name || !surname || !email || !password) {
      return res.status(400).json({ error: "Please fill in all fields (including last name)." });
    }

    // Basic password policy: min 8 chars, at least 1 letter and 1 digit
    const pwdOk = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
    if (!pwdOk) {
      return res.status(400).json({ error: "Password must be at least 8 characters and include a letter and a number." });
    }

    // Check if user already exists
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Email already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (surname is required)
    await createUser(name, email, hashedPassword, surname);

    // Fetch the newly created user to get the ID
    const newUser = await findUserByEmail(email);

    // Create JWT token for auto-login
    const token = jwt.sign(
      {
        id: newUser.ID_USER,
        email: newUser.EMAIL,
        isAdmin: newUser.ISADMIN === 1,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Return token and user info (auto-login after registration)
    return res.status(201).json({
      message: "Account created.",
      token,
      user: {
        id: newUser.ID_USER,
        name: newUser.NAME,
        surname: newUser.SURNAME,
        email: newUser.EMAIL,
        isAdmin: newUser.ISADMIN === 1,
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
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid login." });
    }

    // Vergelijk het ingevoerde wachtwoord met het gehashte wachtwoord
    const isValid = await bcrypt.compare(password, user.PASSWORD);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid login." });
    }

    // Maak een JWT-token aan
    const token = jwt.sign(
      {
        id: user.ID_USER,
        email: user.EMAIL,
        isAdmin: user.ISADMIN === 1,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Stuur token en gebruikersinformatie terug
    return res.json({
      message: "Login success",
      token,
      user: {
        id: user.ID_USER,
        name: user.NAME,
        surname: user.SURNAME,
        email: user.EMAIL,
        isAdmin: user.ISADMIN === 1,
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
