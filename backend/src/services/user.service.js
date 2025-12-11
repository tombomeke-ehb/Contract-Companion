import { query } from "../config/db.js";

// 👉 Zoek user op basis van email
export async function findUserByEmail(email) {
  const sql = `
    SELECT ID_USER, NAME, SURNAME, EMAIL, PASSWORD, ISADMIN
    FROM USERS
    WHERE EMAIL = :email
  `;

  const result = await query(sql, { email });
  return result.rows?.[0] || null;
}

// 👉 Genereer een nieuw ID_USER in code (zonder sequence/trigger)
async function getNextUserId() {
  const sql = `
    SELECT NVL(MAX(ID_USER), 0) + 1 AS NEXT_ID
    FROM USERS
  `;

  const result = await query(sql);
  return result.rows[0].NEXT_ID;
}

// 👉 Maak nieuwe user aan
// surname is verplicht in de DB; als deze niet wordt meegegeven, vallen we terug op name.
export async function createUser(name, email, hashedPassword, surname = null) {
  const finalSurname = surname || name;

  // Bepaal nieuw ID_USER in de applicatie
  const idUser = await getNextUserId();

  const sql = `
    INSERT INTO USERS (ID_USER, NAME, SURNAME, EMAIL, PASSWORD, ISADMIN)
    VALUES (:idUser, :name, :surname, :email, :password, :isAdmin)
  `;

  // standaard geen admin bij registratie
  const isAdmin = 0;

  return await query(
    sql,
    {
      idUser,
      name,
      surname: finalSurname,
      email,
      password: hashedPassword,
      isAdmin,
    },
    { autoCommit: true }
  );
}
