import jwt from "jsonwebtoken";

// Middleware om te controleren of de gebruiker ingelogd is
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  // Controleer of er een Authorization header is
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verifieer het JWT-token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Bewaar gebruikersinfo in de request
    req.user = decoded; // { id, email, isAdmin }

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Middleware om te controleren of de gebruiker admin is
export function isAdmin(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: "Admin access only" });
  }
  next();
}
