import { Router } from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";

const router = Router();

// Simple in-memory rate limiter for auth endpoints
const authAttempts = new Map(); // key: ip, value: { count, expiresAt }
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 20; // per window

function authRateLimit(req, res, next) {
	const ip = req.ip || req.connection.remoteAddress || "unknown";
	const now = Date.now();
	const entry = authAttempts.get(ip);

	if (entry && entry.expiresAt > now) {
		if (entry.count >= MAX_ATTEMPTS) {
			return res.status(429).json({ error: "Too many attempts, please try again later." });
		}
		entry.count += 1;
	} else {
		authAttempts.set(ip, { count: 1, expiresAt: now + WINDOW_MS });
	}

	// Cleanup occasionally (lightweight, in-process)
	if (authAttempts.size > 500) {
		for (const [key, value] of authAttempts.entries()) {
			if (value.expiresAt <= now) authAttempts.delete(key);
		}
	}

	next();
}

router.post("/register", authRateLimit, registerUser);
router.post("/login", authRateLimit, loginUser);

export default router;
