// Korte service-laag voor user-operaties.
// Deze functies praten later met Oracle DB (via de persoon die de DB beheert).

import oracledb from "oracledb";
import { query } from "../config/db.js";

// DB-config halen via .env (voor legacy functies die direct een connectie openen)
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE_NAME}`
};

/**
 * findUserByEmail(email)
 * Zoeken naar een user in de database op basis van e-mail.
 * Haalt 1 gebruiker op, of null als hij niet bestaat.
 */
export async function findUserByEmail(email) {
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT ID, EMAIL, PASSWORD_HASH, IS_ADMIN
       FROM USERS
       WHERE EMAIL = :email`,
      { email }
    );

    // Geen resultaat → user bestaat niet
    if (result.rows.length === 0) return null;

    const row = result.rows[0];

    return {
      id: row[0],
      email: row[1],
      passwordHash: row[2],
      isAdmin: row[3]
    };

  } catch (err) {
    console.error("DB error in findUserByEmail:", err);
    return null;
  } finally {
    if (connection) await connection.close();
  }
}

/**
 * createUser(email, hashedPassword)
 * Gebruiker toevoegen aan de database.
 * NL: "Voegt een nieuwe gebruiker toe en geeft het nieuwe ID terug."
 */
export async function createUser(email, hashedPassword, isAdmin = 0) {
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `INSERT INTO USERS (EMAIL, PASSWORD_HASH, IS_ADMIN)
       VALUES (:email, :passwordHash, :isAdmin)
       RETURNING ID INTO :id`,
      {
        email,
        passwordHash: hashedPassword,
        isAdmin,
        id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      },
      { autoCommit: true }
    );

    return result.outBinds.id[0];

  } catch (err) {
    console.error("DB error in createUser:", err);
    return null;
  } finally {
    if (connection) await connection.close();
  }
}

// ------------------------------
// People (admin dashboard)
// ------------------------------

export async function findPersonByEmail(email) {
  // Gebruikt pooled query helper zodat we geen losse connecties hoeven te beheren.
  const result = await query(
    `SELECT ID_USER, NAME, SURNAME, EMAIL, ISADMIN
     FROM USERS
     WHERE LOWER(EMAIL) = LOWER(:email)` ,
    { email }
  );

  if (!result.rows || result.rows.length === 0) return null;
  return result.rows[0];
}

export async function listPeople() {
  const result = await query(
    `SELECT ID_USER, NAME, SURNAME, EMAIL, ISADMIN
     FROM USERS
     ORDER BY ID_USER DESC`
  );

  return result.rows || [];
}

export async function createPerson({ name, surname = "", email, passwordHash, isAdmin = 0 }) {
  // Haal hoogste ID op en tel er 1 bij
  const maxResult = await query(`SELECT NVL(MAX(ID_USER), 0) + 1 as NEXT_ID FROM USERS`);
  const nextId = maxResult.rows[0].NEXT_ID;
  
  const result = await query(
    `INSERT INTO USERS (ID_USER, NAME, SURNAME, EMAIL, PASSWORD, ISADMIN)
     VALUES (:nextId, :name, :surname, :email, :passwordHash, :isAdmin)
     RETURNING ID_USER INTO :id`,
    {
      nextId,
      name,
      surname,
      email,
      passwordHash,
      isAdmin,
      id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
    },
    { autoCommit: true }
  );

  return result.outBinds.id[0];
}

export async function deletePerson(id) {
  const result = await query(
    `DELETE FROM USERS WHERE ID_USER = :id`,
    { id },
    { autoCommit: true }
  );

  return result.rowsAffected || 0;
}

/**
 * isAdminUser(userId)
 * Check of een user admin is.
 * Geeft true terug als de gebruiker admin is.
 */
export async function isAdminUser(id) {
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT IS_ADMIN FROM USERS WHERE ID = :id`,
      { id }
    );

    if (result.rows.length === 0) return false;

    return result.rows[0][0] === 1;

  } catch (err) {
    console.error("DB error in isAdminUser:", err);
    return false;
  } finally {
    if (connection) await connection.close();
  }
}
