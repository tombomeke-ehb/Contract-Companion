// backend/src/services/user.service.js

import { getConnection } from "../config/db.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/**
 * Zoek user op e-mail
 */
export async function findUserByEmail(email) {
  try {
    const conn = await getConnection();

    const result = await conn.execute(
      `SELECT ID_USI, NAME, EMAIL, PASSWORD, ISADMIN
       FROM USERS
       WHERE EMAIL = :email`,
      [email]
    );

    await conn.close();

    return result.rows.length ? result.rows[0] : null;
  } catch (err) {
    console.error("DB error in findUserByEmail:", err);
    return null;
  }
}

/**
 * Maak een nieuwe user aan.
 */
export async function createUser(name, email, password) {
  try {
    const conn = await getConnection();

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await conn.execute(
      `INSERT INTO USERS (NAME, EMAIL, PASSWORD, ISADMIN)
       VALUES (:name, :email, :password, 0)
       RETURNING ID_USI INTO :id`,
      {
        name,
        email,
        password: hashedPassword,
        id: { dir: "OUT", type: "NUMBER" },
      }
    );

    await conn.commit();
    await conn.close();

    return result.outBinds.id[0];
  } catch (err) {
    console.error("DB error in createUser:", err);
    return null;
  }
}
