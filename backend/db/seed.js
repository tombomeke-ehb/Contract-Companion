// Database seeder - creates test accounts
import sqlite3 from "sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "../data/contracts.db");

const db = new sqlite3.Database(dbPath, async (err) => {
  if (err) {
    console.error("❌ Error connecting to database:", err);
    process.exit(1);
  }

  db.run("PRAGMA journal_mode = WAL");

  try {
    // Check if users already exist
    db.get("SELECT COUNT(*) as count FROM USERS", async (err, row) => {
      if (err) {
        console.error("❌ Error checking users:", err);
        process.exit(1);
      }

      if (row.count > 0) {
        console.log("⚠️  Database already has users. Skipping seeding to avoid duplicates.");
        console.log(
          "If you want to reset, delete the data/contracts.db file and run: npm run db:setup && npm run db:seed"
        );
        db.close();
        return;
      }

      try {
        // Create admin user
        const adminPassword = await bcrypt.hash("Admin123!", 10);
        db.run(
          `INSERT INTO USERS (NAME, SURNAME, EMAIL, PASSWORD, ISADMIN)
           VALUES (?, ?, ?, ?, ?)`,
          ["Admin", "User", "admin@test.com", adminPassword, 1],
          (err) => {
            if (err) {
              console.error("❌ Error creating admin user:", err);
              process.exit(1);
            }
          }
        );

        console.log("✅ Admin account created:");
        console.log("   Email: admin@test.com");
        console.log("   Password: Admin123!");

        // Create normal user
        bcrypt.hash("User123!", 10, (err, userPassword) => {
          if (err) {
            console.error("❌ Error hashing password:", err);
            process.exit(1);
          }

          db.run(
            `INSERT INTO USERS (NAME, SURNAME, EMAIL, PASSWORD, ISADMIN)
             VALUES (?, ?, ?, ?, ?)`,
            ["John", "Doe", "user@test.com", userPassword, 0],
            (err) => {
              if (err) {
                console.error("❌ Error creating user:", err);
                process.exit(1);
              }
            }
          );

          console.log("✅ Normal user account created:");
          console.log("   Email: user@test.com");
          console.log("   Password: User123!");

          // Create preferences for both users
          db.run(
            `INSERT INTO PREFERENCES (ID_USER, THEME, LANG, REGION, SESSION_TIMEOUT, EXPIRY_REMINDER_DAYS, AUTO_DELETE_DAYS, RISK_ALERTS, RISK_ALERTS_EMAIL)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [1, "light", "nl", "BE", 30, 7, 30, 1, 1],
            (err) => {
              if (err) {
                console.error("❌ Error creating admin preferences:", err);
                process.exit(1);
              }
            }
          );

          db.run(
            `INSERT INTO PREFERENCES (ID_USER, THEME, LANG, REGION, SESSION_TIMEOUT, EXPIRY_REMINDER_DAYS, AUTO_DELETE_DAYS, RISK_ALERTS, RISK_ALERTS_EMAIL)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [2, "light", "nl", "BE", 30, 7, 30, 1, 1],
            (err) => {
              if (err) {
                console.error("❌ Error creating user preferences:", err);
                process.exit(1);
              }

              console.log("\n✅ Preferences created for both users");
              console.log("\n🎉 Database seeding complete!");
              console.log("\nYou can now login with either account.");

              db.close();
            }
          );
        });
      } catch (err) {
        console.error("❌ Error seeding database:", err);
        process.exit(1);
      }
    });
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
});
