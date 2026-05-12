import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "../data/contracts.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Error connecting to database:", err);
    process.exit(1);
  }

  console.log("🛠️ Dropping problematic tables...");
  
  db.serialize(() => {
    // Drop tables to force recreation with new schema
    db.run("DROP TABLE IF EXISTS PREFERENCES");
    db.run("DROP TABLE IF EXISTS NOTIFICATIONS");
    
    console.log("✅ Tables dropped. Re-running setup...");
    
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf-8");
    
    db.exec(schema, (err) => {
      if (err) {
        console.error("❌ Error recreating schema:", err);
        process.exit(1);
      }
      console.log("✅ Schema recreated successfully.");
      
      // Now re-run seed.js logic for preferences only
      console.log("🌱 Re-seeding preferences...");
      db.run("INSERT INTO PREFERENCES (ID_USER, THEME, LANG, REGION, SESSION_TIMEOUT, EXPIRY_REMINDER_DAYS, AUTO_DELETE_DAYS, RISK_ALERTS, RISK_ALERTS_EMAIL) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [1, "light", "nl", "BE", 30, 7, 30, 1, 1]);
      db.run("INSERT INTO PREFERENCES (ID_USER, THEME, LANG, REGION, SESSION_TIMEOUT, EXPIRY_REMINDER_DAYS, AUTO_DELETE_DAYS, RISK_ALERTS, RISK_ALERTS_EMAIL) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [2, "light", "nl", "BE", 30, 7, 30, 1, 1], (err) => {
        if (err) console.error("❌ Error seeding preferences:", err);
        else console.log("✅ Preferences seeded.");
        db.close();
      });
    });
  });
});
