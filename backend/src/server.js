// backend/src/server.js
// Entry point for the backend server application

import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

import fs from "fs";
import http from "http";
import https from "https";
import app from "./app.js";
import * as db from "./config/db.js";

const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
// Function to create HTTP or HTTPS server based on environment variables
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

async function start() {
  try {
    await db.connect(); // connect the Oracle DB
    console.log("✅ Oracle DB connected");

    const { server, port, protocol } = createServer();
    server.listen(port, () => {
      console.log(`Backend running at ${protocol}://localhost:${port}`);
    });

  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
}

start();
