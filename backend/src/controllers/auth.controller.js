import bcrypt from "bcryptjs";
import { findUserByEmail, createUser } from "../services/user.service.js";

// REGISTER
export async function registerUser(req, res) {
  try {
    console.log("REQ BODY =", req.body);

    const { name, surname, email, password } = req.body;

    if (!name || !surname || !email || !password) {
      return res.status(400).json({ error: "Please fill in all fields (including last name)." });
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

    return res.status(201).json({ message: "Account created." });

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

    // Compare hashed password
    const isValid = await bcrypt.compare(password, user.PASSWORD);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid login." });
    }

    return res.json({
      message: "Login success",
      user: {
        id: user.ID_USER,
        name: user.NAME,
        email: user.EMAIL,
        isAdmin: user.ISADMIN === 1,
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
