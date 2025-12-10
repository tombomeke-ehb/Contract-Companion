import { query } from "../config/db.js";

// 👉 Zoek user op basis van email
export async function findUserByEmail(email) {
  const sql = `
    SELECT ID_USER, NAME, EMAIL, PASSWORD, ISADMIN, IS_ADMIN
    FROM USERS
    WHERE EMAIL = :email
  `;

  const result = await query(sql, { email });

  return result.rows?.[0] || null;
}

// 👉 Maak nieuwe user aan
export async function createUser(name, email, hashedPassword) {
  const sql = `
    INSERT INTO USERS (NAME, EMAIL, PASSWORD)
    VALUES (:name, :email, :password)
  `;

  return await query(sql, {
    name,
    email,
    password: hashedPassword
  }, { autoCommit: true });
}

