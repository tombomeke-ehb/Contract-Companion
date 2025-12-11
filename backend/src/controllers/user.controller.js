import bcrypt from "bcryptjs";
import { findUserByEmail, createUser } from "../services/user.service.js";

// Admin endpoint om een nieuwe user aan te maken
export async function createUserAdmin(req, res) {
	try {
		const { name, surname, email, password } = req.body;

		if (!name || !surname || !email || !password) {
			return res.status(400).json({ error: "Vul alle velden in (inclusief achternaam)." });
		}

		const existing = await findUserByEmail(email);
		if (existing) {
			return res.status(400).json({ error: "Email bestaat al." });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		await createUser(name, email, hashedPassword, surname);

		return res.status(201).json({ message: "User aangemaakt." });

	} catch (err) {
		console.error("ADMIN CREATE USER ERROR:", err);
		return res.status(500).json({ error: "Internal server error" });
	}
}
