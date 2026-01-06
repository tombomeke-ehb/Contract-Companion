import jwt from "jsonwebtoken";

// Middleware for authenticating users if they are logged in
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  // Controls if the Authorization header is present
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // verify the JWT-token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Keeps usersinfo in the request
    req.user = decoded; // { id, email, isAdmin }

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Middleware to control if the user is an admin
export function isAdmin(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: "Admin access only" });
  }
  next();
}
