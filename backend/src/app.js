// backend/src/app.js

import db from "./config/db";
import express from "express";
import cors from "cors";
import path from "path";
import contractRoutes from "./routes/contract.routes.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// static files
app.use("/public", express.static(path.join(process.cwd(), "public")));

// API routes
app.use("/api/contracts", contractRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

export default app;
