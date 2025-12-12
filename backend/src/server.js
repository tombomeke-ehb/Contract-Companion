// backend/src/server.js

import dotenv from "dotenv";
dotenv.config(); // charge .env AVANT toute importation

import app from "./app.js";
import * as db from "./config/db.js";

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await db.connect(); // connect the Oracle DB
    console.log("✅ Oracle DB connected");

    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
}

start();
