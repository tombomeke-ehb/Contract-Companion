import oracledb from "oracledb";
import { query } from "../config/db.js";

/**
 * findUserByEmail(email)
 * Find a user in the database based on email address.
 * Used by auth (register/login) and admin dashboard.
 */
export async function findUserByEmail(email) {
  const result = await query(
    `SELECT ID_USER, NAME, SURNAME, EMAIL, PASSWORD, ISADMIN
     FROM USERS
     WHERE LOWER(EMAIL) = LOWER(:email)`,
    { email }
  );

  return result.rows?.[0] || null;
}

/**
 * createUser(name, email, hashedPassword, surname)
 * Creates a new user. Used by auth (register).
 */
export async function createUser(name, email, hashedPassword, surname = null) {
  const finalSurname = surname || name;

  // Determine new ID_USER (max + 1)
  const maxResult = await query(`SELECT NVL(MAX(ID_USER), 0) + 1 as NEXT_ID FROM USERS`);
  const nextId = maxResult.rows[0].NEXT_ID;

  const sql = `
    INSERT INTO USERS (ID_USER, NAME, SURNAME, EMAIL, PASSWORD, ISADMIN)
    VALUES (:nextId, :name, :surname, :email, :password, :isAdmin)
  `;

  await query(
    sql,
    {
      nextId,
      name,
      surname: finalSurname,
      email,
      password: hashedPassword,
      isAdmin: 0, // default: not an admin
    },
    { autoCommit: true }
  );

  // Return a simple user-object so the caller doesn't need an extra SELECT
  return {
    id: nextId,
    name,
    surname: finalSurname,
    email,
    isAdmin: 0,
  };
}

// ==============================
// Admin dashboard functions
// ==============================
//query to list all users
export async function listPeople() {
  const result = await query(
    `SELECT ID_USER, NAME, SURNAME, EMAIL, ISADMIN
     FROM USERS
     ORDER BY ID_USER DESC`
  );

  return result.rows || [];
}

export async function createPerson({ name, surname = "", email, passwordHash, isAdmin = 0 }) {
  const maxResult = await query(`SELECT NVL(MAX(ID_USER), 0) + 1 as NEXT_ID FROM USERS`);
  const nextId = maxResult.rows[0].NEXT_ID;

  const result = await query(
    `INSERT INTO USERS (ID_USER, NAME, SURNAME, EMAIL, PASSWORD, ISADMIN)
     VALUES (:nextId, :name, :surname, :email, :passwordHash, :isAdmin)`,
    {
      nextId,
      name,
      surname,
      email,
      passwordHash,
      isAdmin,
    },
    { autoCommit: true }
  );

  return nextId;
}

export async function deletePerson(id) {
  const result = await query(
    `DELETE FROM USERS WHERE ID_USER = :id`,
    { id },
    { autoCommit: true }
  );

  return result.rowsAffected || 0;
}
