import app from "./app.js";
import db from "./config/db.js"; // allows us to use all functions from db.js

// Use a separate port for the backend server, not the Oracle DB port
const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await db.verbinding(); // start DB connection
    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Database connection failed:", err);
    // Logging is enough here; there is no alert in Node.js
  }
}

start();
