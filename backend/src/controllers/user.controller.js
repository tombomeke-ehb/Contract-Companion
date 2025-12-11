import bcrypt from "bcryptjs";
import {
	listPeople as listPeopleDb,
	createPerson as createPersonDb,
	deletePerson as deletePersonDb,
	findUserByEmail,
} from "../services/user.service.js";

const SALT_ROUNDS = 10;

function formatDisplayDate(date = new Date()) {
	return date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

function mapPerson(row) {
	return {
		id: String(row.ID_USER),
		name: row.NAME || "",
		surname: row.SURNAME || "",
		email: row.EMAIL || "",
		phone: "", // No phone in USERS table
		risk: row.ISADMIN === 1 ? "high" : "low",
		riskLabel: row.ISADMIN === 1 ? "Admin" : "User",
		date: formatDisplayDate(),
	};
}

export async function listPeople(_req, res) {
	try {
		const rows = await listPeopleDb();
		return res.json(rows.map(mapPerson));
	} catch (err) {
		console.error("Failed to fetch people:", err);
		return res.status(500).json({ message: "Failed to fetch people." });
	}
}

export async function createPerson(req, res) {
	const { name, surname = "", email, password, isAdmin = 0 } = req.body;

	if (!name || !email || !password) {
		return res.status(400).json({ message: "Name, email and password are required." });
	}

	try {
		const existing = await findUserByEmail(email);
		if (existing) {
			return res.status(409).json({ message: "A person with this email already exists." });
		}

		const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
		const id = await createPersonDb({ name, surname, email, passwordHash, isAdmin });

		return res.status(201).json(
			mapPerson({ ID_USER: id, NAME: name, SURNAME: surname, EMAIL: email, ISADMIN: isAdmin })
		);
	} catch (err) {
		console.error("Failed to create person:", err);
		return res.status(500).json({ message: "Failed to create person." });
	}
}

export async function deletePerson(req, res) {
	const { id } = req.params;

	try {
		const affected = await deletePersonDb(id);
		if (!affected) {
			return res.status(404).json({ message: "Person not found." });
		}

		return res.json({ success: true, removedId: id });
	} catch (err) {
		console.error("Failed to delete person:", err);
		return res.status(500).json({ message: "Failed to delete person." });
	}
}
