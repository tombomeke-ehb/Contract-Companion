// Database setup script for SQLite
import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "../data");
const dbPath = path.join(dataDir, "contracts.db");
const schemaPath = path.join(__dirname, "schema.sql");

// Create data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`📁 Created data directory at ${dataDir}`);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Error connecting to database:", err);
    process.exit(1);
  }

  try {
    // Read schema
    const schema = fs.readFileSync(schemaPath, "utf-8");

    // Execute all statements
    db.exec(schema, (err) => {
      if (err) {
        console.error("❌ Error executing schema:", err);
        process.exit(1);
      }

      console.log("✅ Database schema created successfully");
      console.log(`📍 Database location: ${dbPath}`);

      db.close();
    });
  } catch (err) {
    console.error("❌ Error reading schema:", err);
    process.exit(1);
  }
});
