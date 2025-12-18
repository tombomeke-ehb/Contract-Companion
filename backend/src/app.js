// backend/src/app.js
// Main application setup for the backend server

import express from "express";
import cors from "cors";
import path from "path";
import contractRoutes from "./routes/contract.routes.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import preferenceRoutes from "./routes/preference.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import calendarRoutes from "./routes/calendar.routes.js";


import peopleRoutes from "./routes/people.routes.js";

const app = express();

// Allow both local dev frontend and production frontend on Combell
const allowedOrigins = [
  "http://localhost:5173", // Vite dev server (HTTP)
  "http://localhost:5174", // Vite dev server (alt port)
  "https://localhost:5173", // Vite dev server (HTTPS)
  "https://localhost:5174", // Vite dev server (alt port HTTPS)
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
app.use("/api", adminRoutes);
app.use("/api/people", peopleRoutes);
app.use("/api", calendarRoutes);

export default app;
