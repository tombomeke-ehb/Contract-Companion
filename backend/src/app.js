// backend/src/app.js

import express from "express";
import cors from "cors";
import path from "path";
import contractRoutes from "./routes/contract.routes.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import preferenceRoutes from "./routes/preference.routes.js";

import peopleRoutes from "./routes/people.routes.js";

const app = express();

// Allow both local dev frontend and production frontend on Combell
const allowedOrigins = [
  "http://localhost:5173", // Vite dev server
  "https://ehbcontractcompanion.tombomeke.com", // Combell production frontend
];

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without origin (e.g. curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

// static files
app.use("/public", express.static(path.join(process.cwd(), "public")));

// API routes
app.use("/api/contracts", contractRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/preferences", preferenceRoutes);

app.use("/api/people", peopleRoutes);

export default app;

//voor de login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // ...existing code or future login logic...
  } catch (err) {
    // ...error handling...
  }
});
