// backend/src/server.js

import dotenv from "dotenv";
// Laadt de variabelen uit .env in process.env (poort, DB, HTTPS-certificaten, ...)
dotenv.config();

import fs from "fs";
import http from "http";
import https from "https";
import app from "./app.js";
import * as db from "./config/db.js";

// Standaard HTTP-poort (3000) en optionele HTTPS-poort (3443)
const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// Maakt een HTTP- of HTTPS-server aan op basis van de configuratie in .env
function createServer() {
  const keyPath = process.env.HTTPS_KEY;
  const certPath = process.env.HTTPS_CERT;

  if (keyPath && certPath && fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    const credentials = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
    return { server: https.createServer(credentials, app), port: HTTPS_PORT, protocol: "https" };
  }

  return { server: http.createServer(app), port: PORT, protocol: "http" };
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
    console.error("❌ Database connection failed:", err);
  }
}

start();
