import { query, execute } from "../config/db.js";

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

  const result = await execute(
    `INSERT INTO USERS (NAME, SURNAME, EMAIL, PASSWORD, ISADMIN)
     VALUES (:name, :surname, :email, :password, :isAdmin)`,
    {
      name,
      surname: finalSurname,
      email,
      password: hashedPassword,
      isAdmin: 0,
    }
  );

  // Create default preferences for the new user
  await execute(
    `INSERT INTO PREFERENCES (ID_USER, LANGUAGE, NOTIFICATIONS_ENABLED, REMINDER_DAYS)
     VALUES (:userId, 'nl', 1, 7)`,
    { userId: result.lastID }
  );

  // Return user object
  return {
    id: result.lastID,
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
  const result = await execute(
    `INSERT INTO USERS (NAME, SURNAME, EMAIL, PASSWORD, ISADMIN)
     VALUES (:name, :surname, :email, :passwordHash, :isAdmin)`,
    {
      name,
      surname,
      email,
      passwordHash,
      isAdmin,
    }
  );

  // Create default preferences for the new user
  await execute(
    `INSERT INTO PREFERENCES (ID_USER, LANGUAGE, NOTIFICATIONS_ENABLED, REMINDER_DAYS)
     VALUES (:userId, 'nl', 1, 7)`,
    { userId: result.lastID }
  );

  return result.lastID;
}

// Delete all contract-related records for a given user (but not the user itself)
export async function deleteUserContracts(id) {
  // Order matters because of foreign key-like relationships on ID_DOC
  const tablesWithIdDoc = ["KALENDER", "EINDDATUM", "SAMENVATTING"];
  for (const table of tablesWithIdDoc) {
    await execute(
      `DELETE FROM ${table} WHERE ID_DOC IN (SELECT ID_DOC FROM DOCUMENTEN WHERE ID_USER = :id)`,
      { id }
    );
  }

  // Delete contract reports
  await execute(
    `DELETE FROM CONTRACT_REPORTS WHERE ID_DOC IN (SELECT ID_DOC FROM DOCUMENTEN WHERE ID_USER = :id)`,
    { id }
  );

  // Then delete the documents themselves for this user
  const docResult = await execute(
    `DELETE FROM DOCUMENTEN WHERE ID_USER = :id`,
    { id }
  );

  return docResult.rowsAffected || 0;
}

// Delete the user and all their contracts
export async function deletePerson(id) {
  // First remove all contracts for this user
  await deleteUserContracts(id);

  // Delete user preferences
  await execute(
    `DELETE FROM PREFERENCES WHERE ID_USER = :id`,
    { id }
  );

  // Finally delete the user record
  const result = await execute(
    `DELETE FROM USERS WHERE ID_USER = :id`,
    { id }
  );

  return result.rowsAffected || 0;
}
