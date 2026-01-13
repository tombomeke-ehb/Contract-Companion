// backend/src/server.js
// Entry point for the backend server application

import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

import fs from "fs";
import https from "https";
import app from "./app.js";
import * as db from "./config/db.js";

// Alleen HTTPS-poort (standaard 3443)
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// Maak ALTIJD een HTTPS-server; geen HTTP-fallback meer
function createServer() {
  const keyPath = process.env.HTTPS_KEY;
  const certPath = process.env.HTTPS_CERT;

  if (!keyPath || !certPath) {
    throw new Error("HTTPS configuration missing. Please set HTTPS_KEY and HTTPS_CERT in the environment.");
  }

  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    throw new Error(`HTTPS key/cert files not found at ${keyPath} / ${certPath}.`);
  }

  const credentials = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };

  return { server: https.createServer(credentials, app), port: HTTPS_PORT, protocol: "https" };
}

// Startpunt van de backend: eerst DB-connectie, dan HTTP/HTTPS-server opstarten
async function start() {
  try {
    // Maak verbinding met de Oracle-database vóór de server requests gaat verwerken
    await db.connect();
    console.log("✅ Oracle DB connected");

    const { server, port, protocol } = createServer();
    // Start de server en log duidelijk onder welk protocol en poort hij draait
    server.listen(port, () => {
      console.log(`Backend running at ${protocol}://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Backend startup failed:", err);
  }
}

start();
