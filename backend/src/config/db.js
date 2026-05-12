// Database configuration and connection setup for SQLite

import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "../../data/contracts.db");

let db = null;

// Initialize SQLite database connection
async function connect() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("❌ Failed to connect to SQLite:", err);
        reject(err);
      } else {
        db.run("PRAGMA journal_mode = WAL", (err) => {
          if (err) {
            console.error("Failed to set PRAGMA:", err);
            reject(err);
          } else {
            console.log(`✅ SQLite DB connected at ${dbPath}`);
            resolve(db);
          }
        });
      }
    });
  });
}

// Close database connection
async function closePool() {
  if (db) {
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) reject(err);
        else {
          db = null;
          resolve();
        }
      });
    });
  }
}

// Get database instance
function getDb() {
  if (!db) {
    throw new Error("Database not initialized. Call connect() first.");
  }
  return db;
}

// Query helper - returns rows
async function query(sql, bindParams = {}, options = {}) {
  const database = getDb();

  return new Promise((resolve, reject) => {
    try {
      // Convert Oracle-style SQL to SQLite
      let sqliteSql = sql;
      sqliteSql = sqliteSql.replace(/NVL\s*\(/gi, "COALESCE(");

      // Convert :paramName to $paramName for sqlite3 compatibility
      sqliteSql = sqliteSql.replace(/:(\w+)/g, "$$$1");

      // Convert JS object to match $ parameter names
      const params = {};
      for (const [key, value] of Object.entries(bindParams)) {
        params["$" + key] = value;
      }

      database.all(sqliteSql, params, (err, rows) => {
        if (err) {
          console.error("Query error:", err.message, "SQL:", sql, "Params:", params);
          reject(err);
        } else {
          // Normalize column names to uppercase for Oracle compatibility
          const normalizedRows = (rows || []).map(row => {
            const normalized = {};
            for (const [key, value] of Object.entries(row)) {
              normalized[key.toUpperCase()] = value;
            }
            return normalized;
          });
          resolve({ rows: normalizedRows, rowsAffected: normalizedRows ? normalizedRows.length : 0 });
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

// Execute - for INSERT/UPDATE/DELETE
async function execute(sql, bindParams = {}, options = {}) {
  const database = getDb();

  return new Promise((resolve, reject) => {
    try {
      let sqliteSql = sql;
      sqliteSql = sqliteSql.replace(/NVL\s*\(/gi, "COALESCE(");

      // Convert :paramName to $paramName for sqlite3 compatibility
      sqliteSql = sqliteSql.replace(/:(\w+)/g, "$$$1");

      // Convert JS object to match $ parameter names
      const params = {};
      for (const [key, value] of Object.entries(bindParams)) {
        params["$" + key] = value;
      }

      database.run(sqliteSql, params, function (err) {
        if (err) {
          console.error("Execute error:", err.message, "SQL:", sql, "Params:", params);
          reject(err);
        } else {
          resolve({
            rowsAffected: this.changes,
            lastID: this.lastID,
          });
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

export { connect, closePool, getDb, query, execute };
export default { connect, closePool, getDb, query, execute };
